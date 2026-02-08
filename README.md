# Valetudo

Valetudo is a **mobile-first fitness app** built for DevFest.

Think Hevy (workouts) + MyFitnessPal (food) with a social / community vibe layered on top.

The goal: make health tracking feel less lonely and more alive.

---

What it does

* Workouts

  * Hevy-style routines
  * Quick start workouts
  * Clean dark mode UI

* Food logging

  * Calories + macros (base structure)
  * Built to plug into a food database

* Social feed (WIP)

  * Friends activity
  * Motivation without being annoying

---

**Tech Stack**

**Frontend**
* React (Vite)
* JavaScript
* Plain CSS (no Tailwind)
* Mobile-first layout

**Backend**
* FastAPI (Python)
* REST APIs for food + workouts

**Other**
* Git + GitHub (branch-based workflow)
* Tested on real phones via local network / ngrok

---

## Run it

```bash
npm install
npm run dev

# open on your phone (same WiFi)
npm run dev -- --host
```

---

Built during **DevFest** 🚀
