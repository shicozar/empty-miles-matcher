# RouteShare — Empty Miles Matcher

Matches carriers' empty return legs with shippers' loads along the same route,
and uses Claude to suggest a fair backhaul price. Built for the Sky Innovation
take-home (GROW track).

## The idea

Trucks routinely drive back empty after a delivery — wasted capacity, zero
revenue on the return leg. This app lets carriers post an empty leg and
shippers post a load; a simple rule-based matcher finds viable pairings
(route + date + capacity fit), and Claude suggests a price for each match
with a short rationale.

## Stack

- **Backend:** Node/Express, SQLite (via better-sqlite3 — zero setup, one file,
  no server to run), Claude API for pricing.
- **Frontend:** React + Vite + Tailwind CSS v4, hand-rolled UI components in a
  shadcn-like style.

SQLite instead of Postgres on purpose here: same relational model, but no
separate database server to install/configure for demo. Swapping
to Postgres later would only mean changing `backend/src/db/index.js`.

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY (optional — see below)
npm run seed                # loads demo carriers/loads so matches appear immediately
npm run dev                 # starts API on http://localhost:4000
```

**No API key?** The pricing service falls back to a distance-based heuristic
so the whole app still runs end-to-end without one, useful for quick local
testing, but the real submission should run with a key set so the AI pricing
+ rationale actually comes from Claude.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env        # points at the local API, adjust if needed
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173`. The **Matches** tab loads first and shows the
seeded matches. Use **Post Empty Leg** / **Post a Load** to add your own and
watch new matches appear.

## Deploying (Render)

### Backend — Render Web Service

- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:**
  - `ANTHROPIC_API_KEY` — for Claude pricing (omit to use the heuristic fallback).
  - `FRONTEND_ORIGIN` — comma-separated list of allowed frontend origins for CORS,
    e.g. `https://my-frontend.onrender.com,http://localhost:5173`.
  - `PORT` is set automatically by Render — no need to configure it.

Render's free tier can reset the filesystem (and with it the SQLite file) on
redeploy or after the service spins down from inactivity. The server auto-seeds
demo data on boot whenever the database is empty, so the app always comes back
up with matches to show instead of an empty database.

### Frontend — Render Static Site

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:**
  - `VITE_API_BASE` — the deployed backend URL plus `/api`,
    e.g. `https://my-backend.onrender.com/api`.

## How matching works

`backend/src/services/matcher.js` — a simple, explainable rule-based scorer,
not ML:
1. Filters to loads whose origin/destination fall within ~40 miles of an
   empty leg's route (a small fixed city-coordinate lookup stands in for a
   real geocoding API).
2. Filters to loads whose "needed by" date falls within (or close to) the
   leg's available date window.
3. Filters out loads that exceed the leg's stated capacity.
4. Scores surviving pairs by route closeness + date fit.

`backend/src/services/pricing.js` then asks Claude, for each match, to
suggest a price below a normal dedicated-haul rate (since the truck is
driving that route regardless) plus a one-line rationale.

## What's intentionally left out

No auth, no payments, no live geocoding/routing API, no real carrier
integration — kept out on purpose so the limited time went into the matching
logic, the pricing story, and a clean demo instead of infrastructure.
