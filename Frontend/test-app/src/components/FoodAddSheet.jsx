import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./FoodAddSheet.css";

export default function FoodAddSheet({
  open,
  onClose,
  mode,
  onCreateFood,
  customFoods,
  onToggleFavorite,
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
  const scanLockRef = useRef(false);
  const lastDetectedCodeRef = useRef("");
  const lastAddedCodeRef = useRef("");
  const zxingRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setShowCustomForm(false);
  }, [mealTab]);

  useEffect(() => {
    if (open) {
      setShowCustomForm(false);
    }
  }, [open]);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    scanLockRef.current = false;
    setCameraOpen(false);
  };

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;
    setCameraError("");
    setBarcodeError("");
    lastDetectedCodeRef.current = "";
    lastAddedCodeRef.current = "";
    setManualBarcode("");

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError("Camera permission denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  useEffect(() => {
    if (!cameraOpen || cameraMode !== "barcode") return;

    let cancelled = false;
    scanLockRef.current = false;
    const detector =
      "BarcodeDetector" in window
        ? new window.BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
          })
        : null;

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
            if (!code) return;
            if (code === lastDetectedCodeRef.current) {
              closeCamera();
              return;
            }
            lastDetectedCodeRef.current = code;
            scanLockRef.current = true;
            setBarcodeResult(code);
            setScanLookup({ status: "loading", code });
            closeCamera();
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
      setBarcodeError("Using fallback scanner (slower on iOS).");
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

    const reader = new BrowserMultiFormatReader();
    zxingRef.current = reader;

    reader.decodeFromVideoElement(videoRef.current, (result) => {
      if (!result || scanLockRef.current) return;
      const code = result.getText();
      if (!code) return;
      if (code === lastDetectedCodeRef.current) {
        closeCamera();
        return;
      }
      lastDetectedCodeRef.current = code;
      scanLockRef.current = true;
      setBarcodeResult(code);
      setScanLookup({ status: "loading", code });
      closeCamera();
    });

    return () => {
      reader.reset();
      zxingRef.current = null;
    };
  }, [cameraOpen, cameraMode]);

  useEffect(() => {
    if (!scanLookup || !scanLookup.code) return;
    if (lastAddedCodeRef.current === scanLookup.code) return;
    let cancelled = false;

    const fetchFood = async () => {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${scanLookup.code}.json`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status !== 1 || !data.product) {
          setScanLookup({ status: "error", code: scanLookup.code, message: "No product found." });
          return;
        }
        const p = data.product;
        const nutr = p.nutriments || {};
        const name = p.product_name || p.generic_name || "Scanned food";
        const calories = Math.round(Number(nutr["energy-kcal_100g"] || nutr["energy-kcal_serving"] || 0));
        const protein = Math.round(Number(nutr.proteins_100g || nutr.proteins_serving || 0));
        const carbs = Math.round(Number(nutr.carbohydrates_100g || nutr.carbohydrates_serving || 0));
        const fat = Math.round(Number(nutr.fat_100g || nutr.fat_serving || 0));

        onAddMealFromScan?.({
          name,
          calories,
          protein,
          carbs,
          fat,
          detail: "Scanned food",
        });

        lastAddedCodeRef.current = scanLookup.code;
        setScanLookup({ status: "success", code: scanLookup.code, name });
      } catch {
        if (!cancelled) {
          setScanLookup({ status: "error", code: scanLookup.code, message: "Lookup failed." });
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
    closeCamera();
    setFoodView("root");
    setMealTab("all");
    setShowCustomForm(false);
    setFoodName("");
    setServings("");
    setCaloriesPerServing("");
    onClose();
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
                    setCameraOpen(true);
                  }}
                >
                  <span className="sheetActionIcon">▮▯▮</span>
                  Scan barcode
                </button>
                <button
                  className="sheetAction"
                  onClick={() => {
                    setCameraMode("photo");
                    setCameraError("");
                    setBarcodeError("");
                    setCameraOpen(true);
                  }}
                >
                  <span className="sheetActionIcon">📷</span>
                  Photo Log
                </button>
                {barcodeResult ? <div className="scanResult">Last scan: {barcodeResult}</div> : null}
                {scanLookup?.status === "loading" ? <div className="scanResult">Looking up food…</div> : null}
                {scanLookup?.status === "success" ? <div className="scanResult">Added: {scanLookup.name}</div> : null}
                {scanLookup?.status === "error" ? <div className="scanResult">Lookup failed: {scanLookup.message}</div> : null}
                {capturedImage ? <img className="capturedPreview" src={capturedImage} alt="Captured food" /> : null}
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
                    <div className="sheetOption">
                      <div className="sheetOptionTitle">All meals</div>
                      <div className="sheetOptionSub">Browse the full database</div>
                    </div>
                  )}
                  {mealTab === "favorites" && (
                    <div className="customList">
                      <div className="sheetOptionTitle">Favorite meals</div>
                      {customFoods && customFoods.some((food) => food.favorite) ? (
                        customFoods
                          .filter((food) => food.favorite)
                          .map((food) => (
                            <div key={food.id} className="sheetOption rowBetween">
                              <div>
                                <div className="sheetOptionTitle">{food.name}</div>
                                <div className="sheetOptionSub">{food.detail}</div>
                              </div>
                              <button
                                className={`starBtn ${food.favorite ? "active" : ""}`}
                                onClick={() => onToggleFavorite?.(food.id)}
                                aria-label="Toggle favorite"
                              >
                                {food.favorite ? "★" : "☆"}
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
                                <div key={food.id} className="sheetOption rowBetween">
                                  <div>
                                    <div className="sheetOptionTitle">{food.name}</div>
                                    <div className="sheetOptionSub">{food.detail}</div>
                                  </div>
                                  <button
                                    className={`starBtn ${food.favorite ? "active" : ""}`}
                                    onClick={() => onToggleFavorite?.(food.id)}
                                    aria-label="Toggle favorite"
                                  >
                                    {food.favorite ? "★" : "☆"}
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
              <div className="cameraTitle">{cameraMode === "barcode" ? "Scan barcode" : "Photo log"}</div>
              <button className="xBtn" onClick={closeCamera} aria-label="Close camera">
                ✕
              </button>
            </div>
            <div className="cameraBody">
              <video ref={videoRef} className="cameraVideo" autoPlay playsInline />
              {cameraError ? <div className="cameraError">{cameraError}</div> : null}
              {barcodeError ? <div className="cameraWarn">{barcodeError}</div> : null}
              <div className="cameraHint">
                {cameraMode === "barcode" ? "Center the barcode in the frame." : "Frame your food and tap to capture."}
              </div>
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
                      setBarcodeResult(code);
                      setScanLookup({ status: "loading", code });
                      closeCamera();
                    }}
                  >
                    Look up
                  </button>
                </div>
              ) : null}
              {cameraMode === "photo" && !cameraError ? (
                <button
                  className="cameraCapture"
                  type="button"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth || 720;
                    canvas.height = video.videoHeight || 960;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
                    closeCamera();
                  }}
                >
                  Capture
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
