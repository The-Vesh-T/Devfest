import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { getCatalogFoodByBarcode, upsertCatalogFood } from "../lib/foodRepo";
import "./FoodAddSheet.css";

const toSafeInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
};

const cleanEnvValue = (value) => `${value ?? ""}`.trim().replace(/^['"]|['"]$/g, "");

const sanitizeGeminiFood = (payload) => {
  const name = `${payload?.name ?? "Photo meal"}`.trim() || "Photo meal";
  const detail = `${payload?.detail ?? "Estimated from photo"}`.trim() || "Estimated from photo";
  return {
    name,
    calories: toSafeInt(payload?.calories),
    protein: toSafeInt(payload?.protein),
    carbs: toSafeInt(payload?.carbs),
    fat: toSafeInt(payload?.fat),
    detail,
  };
};

const parseGeminiJson = (rawText) => {
  const text = `${rawText ?? ""}`.trim();
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];
const BARCODE_DUPLICATE_COOLDOWN_MS = 12000;
const GEMINI_KEY_STORAGE_KEY = "valetudo_gemini_api_key";

const toGeminiErrorMessage = (rawText, statusCode) => {
  const fallback = `Gemini request failed (${statusCode})`;
  if (!rawText) return fallback;
  try {
    const parsed = JSON.parse(rawText);
    const message = `${parsed?.error?.message ?? ""}`.trim();
    if (message) return message;
  } catch {
    // Keep fallback path.
  }
  return rawText.slice(0, 220) || fallback;
};

export default function FoodAddSheet({
  open,
  onClose,
  mode,
  onCreateFood,
  allMeals,
  favoriteMeals,
  customFoods,
  isMealFavorite,
  onToggleMealFavorite,
  onAddMeal,
  onAddMealFromScan,
}) {
  const [foodView, setFoodView] = useState("root"); // root | add-meal
  const [mealTab, setMealTab] = useState("all"); // all | favorites | custom
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [servings, setServings] = useState("");
  const [caloriesPerServing, setCaloriesPerServing] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState("barcode"); // barcode | photo
  const [cameraError, setCameraError] = useState("");
  const [barcodeError, setBarcodeError] = useState("");
  const [barcodeResult, setBarcodeResult] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [capturedImage, setCapturedImage] = useState("");
  const [scanLookup, setScanLookup] = useState(null);
  const [photoLookup, setPhotoLookup] = useState(null);
  const scanLockRef = useRef(false);
  const photoLockRef = useRef(false);
  const lastDetectedCodeRef = useRef("");
  const lastAddedCodeRef = useRef("");
  const lastAddedAtRef = useRef(0);
  const barcodeSessionRef = useRef(0);
  const zxingRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const envGeminiApiKey = cleanEnvValue(
    import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_KEY ||
      import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      import.meta.env.NEXT_PUBLIC_GEMINI_KEY
  );
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState("");
  const geminiApiKey = cleanEnvValue(envGeminiApiKey || localGeminiApiKey);

  const safeResetZxing = () => {
    if (!zxingRef.current) return;
    try {
      zxingRef.current.reset();
    } catch {
      // Ignore scanner reset race conditions.
    }
    zxingRef.current = null;
  };

  useEffect(() => {
    setShowCustomForm(false);
  }, [mealTab]);

  useEffect(() => {
    if (open) {
      setShowCustomForm(false);
      setCameraMode("barcode");
      setPhotoLookup(null);
      photoLockRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = cleanEnvValue(window.localStorage.getItem(GEMINI_KEY_STORAGE_KEY) || "");
      if (saved) setLocalGeminiApiKey(saved);
    } catch {
      // Ignore localStorage access issues.
    }
  }, []);

  const persistGeminiKey = (value) => {
    const cleaned = cleanEnvValue(value);
    if (!cleaned) return "";
    setLocalGeminiApiKey(cleaned);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(GEMINI_KEY_STORAGE_KEY, cleaned);
      } catch {
        // Ignore localStorage write issues.
      }
    }
    return cleaned;
  };

  const estimateFoodFromPhoto = async (imageDataUrl) => {
    let activeGeminiApiKey = cleanEnvValue(geminiApiKey);
    if (!activeGeminiApiKey && typeof window !== "undefined") {
      const typed = window.prompt("Enter Gemini API key for Photo Log");
      activeGeminiApiKey = persistGeminiKey(typed || "");
    }
    if (!activeGeminiApiKey) {
      throw new Error("Missing Gemini API key");
    }
    const [, base64Part] = `${imageDataUrl}`.split(",");
    if (!base64Part) {
      throw new Error("Invalid image capture");
    }

    const prompt =
      "Estimate nutrition for the single main food in this image. " +
      "Return strict JSON only with keys: name, calories, protein, carbs, fat, detail. " +
      "Use integer values for macros and calories. Keep detail short.";

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Part,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    };

    let lastError = null;
    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeGeminiApiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(toGeminiErrorMessage(errorText, response.status));
        }

        const data = await response.json();
        const combinedText = (data?.candidates?.[0]?.content?.parts || [])
          .map((part) => part?.text || "")
          .join(" ")
          .trim();

        const parsed = parseGeminiJson(combinedText);
        if (!parsed) {
          throw new Error("Gemini returned an invalid response");
        }
        return sanitizeGeminiFood(parsed);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to estimate calories from photo.");
  };

  const closeCamera = () => {
    safeResetZxing();
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // Ignore pause errors from detached media elements.
      }
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop race conditions.
        }
      });
      streamRef.current = null;
    }
    scanLockRef.current = false;
    setCameraOpen(false);
  };

  const resetSheetAndClose = () => {
    closeCamera();
    setCameraMode("barcode");
    setFoodView("root");
    setMealTab("all");
    setShowCustomForm(false);
    setFoodName("");
    setServings("");
    setCaloriesPerServing("");
    setScanLookup(null);
    setBarcodeResult("");
    onClose?.();
  };

  const shouldIgnoreDetectedCode = (code, sessionId) => {
    if (!code) return true;
    if (sessionId !== barcodeSessionRef.current) return true;
    if (scanLockRef.current) return true;

    const isRecentDuplicate =
      code === lastAddedCodeRef.current &&
      Date.now() - lastAddedAtRef.current < BARCODE_DUPLICATE_COOLDOWN_MS;
    if (isRecentDuplicate) {
      setBarcodeError("Same as last scan. Scan a different barcode.");
      return true;
    }
    if (code === lastDetectedCodeRef.current) return true;
    return false;
  };

  const beginBarcodeLookup = (code, sessionId) => {
    if (shouldIgnoreDetectedCode(code, sessionId)) return;
    lastDetectedCodeRef.current = code;
    scanLockRef.current = true;
    setBarcodeError("");
    setBarcodeResult(code);
    setScanLookup({ status: "loading", code, sessionId });
    closeCamera();
  };

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;
    setCameraError("");
    setBarcodeError("");
    lastDetectedCodeRef.current = "";
    setManualBarcode("");

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // Ignore track stop race conditions.
            }
          });
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError("Camera permission denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // Ignore track stop race conditions.
          }
        });
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  useEffect(() => {
    if (!cameraOpen || cameraMode !== "barcode") return;
    barcodeSessionRef.current += 1;
    scanLockRef.current = false;
    lastDetectedCodeRef.current = "";
    setBarcodeError("");
  }, [cameraOpen, cameraMode]);

  useEffect(() => {
    if (!cameraOpen || cameraMode !== "barcode") return;

    let cancelled = false;
    const sessionId = barcodeSessionRef.current;
    scanLockRef.current = false;
    const detector =
      "BarcodeDetector" in window
        ? new window.BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
          })
        : null;

    const handleDetected = (code) => {
      beginBarcodeLookup(code, sessionId);
    };

    const scanLoop = async () => {
      if (cancelled || !videoRef.current || scanLockRef.current) return;
      if (videoRef.current.readyState < 2) {
        setTimeout(scanLoop, 500);
        return;
      }
      try {
        if (detector) {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const code = codes[0].rawValue || "";
            handleDetected(code);
            return;
          }
        }
      } catch {
        setBarcodeError("Unable to scan barcode. Try more light or a clearer angle.");
      }
      setTimeout(scanLoop, 500);
    };

    if (detector) {
      scanLoop();
    } else {
      setBarcodeError("Using fallback scanner (slower on some browsers).");
    }

    return () => {
      cancelled = true;
      scanLockRef.current = false;
    };
  }, [cameraOpen, cameraMode]);

  useEffect(() => {
    if (!cameraOpen || cameraMode !== "barcode") return;
    if ("BarcodeDetector" in window) return;
    if (!videoRef.current) return;
    const sessionId = barcodeSessionRef.current;

    const reader = new BrowserMultiFormatReader();
    zxingRef.current = reader;

    try {
      reader.decodeFromVideoElement(videoRef.current, (result) => {
        if (!result) return;
        const code = result.getText();
        beginBarcodeLookup(code, sessionId);
      });
    } catch {
      setBarcodeError("Unable to start fallback scanner.");
    }

    return () => {
      try {
        reader.reset();
      } catch {
        // Ignore scanner reset race conditions.
      }
      zxingRef.current = null;
    };
  }, [cameraOpen, cameraMode]);

  useEffect(() => {
    if (!scanLookup || scanLookup.status !== "loading" || !scanLookup.code) return;
    if (scanLookup.sessionId !== barcodeSessionRef.current) return;
    const isRecentDuplicate =
      scanLookup.code === lastAddedCodeRef.current &&
      Date.now() - lastAddedAtRef.current < BARCODE_DUPLICATE_COOLDOWN_MS;
    if (isRecentDuplicate) return;
    let cancelled = false;
    const activeSessionId = scanLookup.sessionId;

    const fetchFood = async () => {
      const commitMeal = async (food) => {
        if (cancelled || !food) return;
        if (activeSessionId !== barcodeSessionRef.current) return;
        await onAddMealFromScan?.({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          detail: food.detail || "Scanned food",
          barcode: scanLookup.code,
        });
        if (cancelled) return;
        if (activeSessionId !== barcodeSessionRef.current) return;

        lastAddedCodeRef.current = scanLookup.code;
        lastAddedAtRef.current = Date.now();
        setScanLookup({ status: "success", code: scanLookup.code, name: food.name, sessionId: activeSessionId });
        resetSheetAndClose();
      };

      try {
        const { data: cachedFood, error: cacheError } = await getCatalogFoodByBarcode(scanLookup.code);
        if (cacheError) {
          console.error("Failed to read barcode from cache", cacheError);
        }
        if (cachedFood) {
          await commitMeal(cachedFood);
          return;
        }

        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${scanLookup.code}.json`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status !== 1 || !data.product) {
          if (activeSessionId === barcodeSessionRef.current) {
            setScanLookup({ status: "error", code: scanLookup.code, message: "No product found.", sessionId: activeSessionId });
          }
          return;
        }
        const p = data.product;
        const nutr = p.nutriments || {};
        const name = p.product_name || p.generic_name || "Scanned food";
        const toSafeMacro = (value) => {
          const n = Number(value);
          if (!Number.isFinite(n) || n < 0) return 0;
          return Math.round(n);
        };
        const calories = toSafeMacro(nutr["energy-kcal_100g"] ?? nutr["energy-kcal_serving"] ?? 0);
        const protein = toSafeMacro(nutr.proteins_100g ?? nutr.proteins_serving ?? 0);
        const carbs = toSafeMacro(nutr.carbohydrates_100g ?? nutr.carbohydrates_serving ?? 0);
        const fat = toSafeMacro(nutr.fat_100g ?? nutr.fat_serving ?? 0);

        const scannedFood = {
          name,
          calories,
          protein,
          carbs,
          fat,
          detail: "Scanned food",
        };

        await commitMeal(scannedFood);

        const { error: cacheWriteError } = await upsertCatalogFood({
          barcode: scanLookup.code,
          food: scannedFood,
          source: "openfoodfacts",
        });
        if (cacheWriteError) {
          console.error("Failed to cache scanned barcode", cacheWriteError);
        }
      } catch {
        if (!cancelled) {
          if (activeSessionId === barcodeSessionRef.current) {
            setScanLookup({ status: "error", code: scanLookup.code, message: "Lookup failed.", sessionId: activeSessionId });
          }
        }
      }
    };

    fetchFood();

    return () => {
      cancelled = true;
    };
  }, [scanLookup, onAddMealFromScan]);

  if (!open) return null;

  const handleClose = () => {
    resetSheetAndClose();
  };

  const handleCreateFood = () => {
    const cleanName = foodName.trim();
    const servingsNum = Number(servings);
    const caloriesNum = Number(caloriesPerServing);

    if (!cleanName || Number.isNaN(servingsNum) || Number.isNaN(caloriesNum) || servingsNum <= 0 || caloriesNum <= 0) {
      return;
    }

    onCreateFood?.({
      name: cleanName,
      servings: servingsNum,
      calories: Math.round(servingsNum * caloriesNum),
      protein: 0,
      carbs: 0,
      fat: 0,
      detail: `${servingsNum} serving${servingsNum === 1 ? "" : "s"} • ${caloriesNum} kcal/serving`,
    });

    setFoodName("");
    setServings("");
    setCaloriesPerServing("");
    setShowCustomForm(false);
  };

  const handleMealPick = async (food) => {
    if (!food) return;
    await onAddMeal?.({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      detail: food.detail,
      barcode: food.barcode ?? null,
    });
    handleClose();
  };

  const formatCalories = (food) => {
    const value = Number(food?.calories);
    return `${Number.isFinite(value) ? Math.round(value) : 0} kcal`;
  };

  const handlePhotoCapture = async () => {
    if (photoLockRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    photoLockRef.current = true;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      photoLockRef.current = false;
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedImage(imageDataUrl);
    closeCamera();
    setPhotoLookup({ status: "loading" });

    try {
      const estimatedFood = await estimateFoodFromPhoto(imageDataUrl);
      await onAddMealFromPhoto?.(estimatedFood);
      setPhotoLookup({
        status: "success",
        name: estimatedFood.name,
        calories: estimatedFood.calories,
      });
      handleClose();
    } catch (error) {
      console.error("Photo log lookup failed", error);
      const message = `${error?.message ?? ""}`.trim();
      setPhotoLookup({
        status: "error",
        message: message || "Unable to estimate calories from photo.",
      });
    } finally {
      photoLockRef.current = false;
    }
  };

  return (
    <div className={`sheetBackdrop ${mode === "food" && foodView === "add-meal" ? "foodPageBackdrop" : ""}`} onClick={handleClose} role="presentation">
      <div
        className={`sheet ${mode === "food" && foodView === "add-meal" ? "foodAddPage" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sheetHandle" />
        <div className="sheetHeader">
          <div className="sheetTitle">{mode === "food" && foodView === "add-meal" ? "" : `Add ${mode === "food" ? "food" : "workout"}`}</div>
          <button className="xBtn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {mode === "food" ? (
          <>
            {foodView === "root" ? (
              <div className="sheetActions">
                <button className="sheetAction" onClick={() => setFoodView("add-meal")}>
                  <span className="sheetActionIcon">🍽️</span>
                  Add meal
                </button>
                <button
                  className="sheetAction"
                  onClick={() => {
                    setCameraMode("barcode");
                    setCameraError("");
                    setBarcodeError("");
                    setScanLookup(null);
                    setBarcodeResult("");
                    setCameraOpen(true);
                  }}
                >
                  <span className="sheetActionIcon">▮▯▮</span>
                  Scan barcode
                </button>
                {barcodeResult ? <div className="scanResult">Last scan: {barcodeResult}</div> : null}
                {scanLookup?.status === "loading" ? <div className="scanResult">Looking up food…</div> : null}
                {scanLookup?.status === "success" ? <div className="scanResult">Added: {scanLookup.name}</div> : null}
                {scanLookup?.status === "error" ? <div className="scanResult">Lookup failed: {scanLookup.message}</div> : null}
              </div>
            ) : (
              <div className="foodAddBody">
                <div className="mealTabs" role="tablist" aria-label="Meal categories">
                  <button
                    className={`mealTab ${mealTab === "all" ? "active" : ""}`}
                    onClick={() => setMealTab("all")}
                    role="tab"
                    aria-selected={mealTab === "all"}
                    type="button"
                  >
                    All meals
                  </button>
                  <button
                    className={`mealTab ${mealTab === "favorites" ? "active" : ""}`}
                    onClick={() => setMealTab("favorites")}
                    role="tab"
                    aria-selected={mealTab === "favorites"}
                    type="button"
                  >
                    Favorite meals
                  </button>
                  <button
                    className={`mealTab custom ${mealTab === "custom" ? "active" : ""}`}
                    onClick={() => setMealTab("custom")}
                    role="tab"
                    aria-selected={mealTab === "custom"}
                    type="button"
                  >
                    Custom meal
                  </button>
                </div>

                <div className="mealTabPanel" role="tabpanel">
                  {mealTab === "all" && (
                    <div className="customList">
                      <div className="sheetOptionTitle">All meals</div>
                      {allMeals && allMeals.length > 0 ? (
                        allMeals.map((food) => (
                          <div
                            key={food.id}
                            className="sheetOption rowBetween mealPickRow"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleMealPick(food)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleMealPick(food);
                              }
                            }}
                          >
                            <div>
                              <div className="sheetOptionTitle">{food.name}</div>
                              <div className="sheetOptionSub">{food.detail}</div>
                              <div className="sheetOptionSub">{formatCalories(food)}</div>
                            </div>
                            <button
                              className={`starBtn ${isMealFavorite?.(food) ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleMealFavorite?.(food);
                              }}
                              aria-label="Toggle favorite"
                            >
                              {isMealFavorite?.(food) ? "★" : "☆"}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="sheetOption">
                          <div className="sheetOptionSub">No meals yet.</div>
                        </div>
                      )}
                    </div>
                  )}
                  {mealTab === "favorites" && (
                    <div className="customList">
                      <div className="sheetOptionTitle">Favorite meals</div>
                      {favoriteMeals && favoriteMeals.length > 0 ? (
                        favoriteMeals.map((food) => (
                            <div
                              key={food.id}
                              className="sheetOption rowBetween mealPickRow"
                              role="button"
                              tabIndex={0}
                              onClick={() => handleMealPick(food)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleMealPick(food);
                                }
                              }}
                            >
                              <div>
                                <div className="sheetOptionTitle">{food.name}</div>
                                <div className="sheetOptionSub">{food.detail}</div>
                                <div className="sheetOptionSub">{formatCalories(food)}</div>
                              </div>
                              <button
                                className={`starBtn ${isMealFavorite?.(food) ? "active" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleMealFavorite?.(food);
                                }}
                                aria-label="Toggle favorite"
                              >
                                {isMealFavorite?.(food) ? "★" : "☆"}
                              </button>
                            </div>
                        ))
                      ) : (
                        <div className="sheetOption">
                          <div className="sheetOptionSub">No favorites yet.</div>
                        </div>
                      )}
                    </div>
                  )}
                  {mealTab === "custom" && (
                    <div className="customStack">
                      {showCustomForm ? (
                        <div className="customHeader backOnly">
                          <button className="backBtn" onClick={() => setShowCustomForm(false)} aria-label="Back">
                            ←
                          </button>
                        </div>
                      ) : null}

                      {!showCustomForm ? (
                        <>
                          <div className="customList">
                            <div className="sheetOptionTitle">Custom foods</div>
                            {customFoods && customFoods.length > 0 ? (
                              customFoods.map((food) => (
                                <div
                                  key={food.id}
                                  className="sheetOption rowBetween mealPickRow"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleMealPick(food)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleMealPick(food);
                                    }
                                  }}
                                >
                                  <div>
                                    <div className="sheetOptionTitle">{food.name}</div>
                                    <div className="sheetOptionSub">{food.detail}</div>
                                    <div className="sheetOptionSub">{formatCalories(food)}</div>
                                  </div>
                                  <button
                                    className={`starBtn ${isMealFavorite?.(food) ? "active" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleMealFavorite?.(food);
                                    }}
                                    aria-label="Toggle favorite"
                                  >
                                    {isMealFavorite?.(food) ? "★" : "☆"}
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="sheetOption">
                                <div className="sheetOptionSub">No custom foods yet.</div>
                              </div>
                            )}
                          </div>
                          <div className="customFooter">
                            <button className="smallBtn smallBtnPrimary" onClick={() => setShowCustomForm(true)}>
                              Create food
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="customMealForm">
                          <div className="sheetOptionTitle">Create a food</div>
                          <div className="sheetOptionSub">Build your own meal item.</div>
                          <input
                            className="input"
                            placeholder="Food name (e.g., Turkey sandwich)"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                          />
                          <div className="row">
                            <input
                              className="input"
                              placeholder="Servings"
                              inputMode="decimal"
                              value={servings}
                              onChange={(e) => setServings(e.target.value)}
                            />
                            <input
                              className="input"
                              placeholder="Calories per serving"
                              inputMode="decimal"
                              value={caloriesPerServing}
                              onChange={(e) => setCaloriesPerServing(e.target.value)}
                            />
                          </div>
                          <button className="primaryBtn" onClick={handleCreateFood}>
                            Create food
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <input className="input" placeholder="Workout name (e.g., Push Day)" />
            <input className="input" placeholder="Notes (optional)" />
            <button className="primaryBtn">Save workout</button>
          </>
        )}
      </div>

      {cameraOpen ? (
        <div className="cameraBackdrop" onClick={closeCamera} role="presentation">
          <div className="cameraCard" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="cameraHeader">
              <div className="cameraTitle">Scan barcode</div>
              <button className="xBtn" onClick={closeCamera} aria-label="Close camera">
                ✕
              </button>
            </div>
            <div className="cameraBody">
              <video ref={videoRef} className="cameraVideo" autoPlay playsInline />
              {cameraError ? <div className="cameraError">{cameraError}</div> : null}
              {barcodeError ? <div className="cameraWarn">{barcodeError}</div> : null}
              <div className="cameraHint">Center the barcode in the frame.</div>
              {cameraMode === "barcode" && scanLookup?.status === "loading" ? (
                <div className="cameraScanStatus">Looking up barcode…</div>
              ) : null}
              {cameraMode === "barcode" ? (
                <div className="barcodeManual">
                  <input
                    className="barcodeInput"
                    placeholder="Enter barcode manually"
                    inputMode="numeric"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                  />
                  <button
                    className="barcodeLookup"
                    type="button"
                    onClick={() => {
                      const code = manualBarcode.trim();
                      if (!code) return;
                      beginBarcodeLookup(code, barcodeSessionRef.current);
                    }}
                  >
                    Look up
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
