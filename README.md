# Gym Practice (Vite + React)

This version matches your training philosophy:
- **One set per exercise**
- **Stable targets** (weight+reps) most of the time
- Quick +/- tweaks when you decide to change
- **Inevitable / Contested** colors the whole exercise tile
- **History view** (previous Day A / Day B sessions)
- Each exercise shows **its own history** like: `185 lb × 8 — 13x`

## Install & run
```bash
npm install
npm run dev
```

## Edit your routine + defaults
Open `src/App.jsx`:
- `PROGRAM` to set default weights/reps (or incline/speed for walking)
- `EXERCISE_MUSCLES` to refine S/L mapping
- Tap an exercise name for its **individual muscle map** + full history
