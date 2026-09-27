

Readme · MD
<h1 align="center">PlanetPulse</h1>
<p align="center"><i>Know your footprint. Shape your choices.</i></p>

<p align="center">
  <a href="https://github.com/saumyayadav2603-dot/PlanetPulse/stargazers"><img src="https://img.shields.io/github/stars/saumyayadav2603-dot/PlanetPulse?style=flat" alt="stars"/></a>
  <a href="https://github.com/saumyayadav2603-dot/PlanetPulse/issues"><img src="https://img.shields.io/github/issues/saumyayadav2603-dot/PlanetPulse" alt="issues"/></a>
  <img src="https://img.shields.io/badge/React-Vite-blue" alt="stack"/>
  <img src="https://img.shields.io/badge/Node-Express%20%2B%20MongoDB-3EBD79" alt="backend stack"/>
</p>
<p align="center">
  🔗 <a href="https://planet-pulse-liart.vercel.app/">Live Demo</a> ·
  🎥 <a href="https://youtu.be/your-video-id">Demo Video</a> ·
  💻 <a href="https://github.com/saumyayadav2603-dot/PlanetPulse">GitHub Repo</a>
</p>
---
 
## Team
 
| Saumya Yadav | Leader &  Developer | [@saumyayadav2603-dot](https://github.com/saumyayadav2603-dot) | 

| Riya Raj Singh | Frontend development | (https://github.com/anishral) |

| Anmol Roy | Backend development | (https://github.com/Trinity-ops-ux)
 
 
## Table of Contents
 
- [Problem](#problem)
- [Solution](#solution)
- [Core Features](#core-features)
- [Standout Features](#standout-features)
- [Tech Stack](#tech-stack)
- [How CO2 Calculation Works](#how-co2-calculation-works)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Data Storage](#data-storage)
- [Product Decisions](#product-decisions)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Hackathon Context](#hackathon-context)
- [Acknowledgements](#acknowledgements)
---
 
## Problem
 
Most people understand that everyday choices have environmental impact, but the cost is usually hidden behind vague assumptions and unclear units. PlanetPulse makes personal footprint data visible, understandable, and actionable.
 
## Solution
 
PlanetPulse is a premium climate-tech dashboard for tracking weekly carbon impact from daily activities such as travel, electricity use, meals, and waste. It transforms routine decisions into transparent, weekly insights.
 
The app started as a fully client-side (localStorage-only) experience and now also persists activities and settings to a MongoDB-backed API — while remaining fully usable offline, since the frontend falls back to localStorage whenever the backend is unreachable.
 
## Core Features
 
- Activity logging for transport, electricity, meals, and waste
- Official emission-factor calculations with transparent formula display
- Weekly target tracking with a supportive over-target experience
- Weekly dashboard summaries, pattern insights, and 7-day footprint bars
- History with activity and date filtering
- localStorage persistence across refreshes, with optional MongoDB persistence via the backend API
- What-If comparison using the same official factors
## Standout Features
 
- Pulse Insight
- Your Footprint Patterns
- 7-Day Footprint Pulse
- Weekly Recap
- Calculation transparency
- Personal milestones
- Success feedback for logged activity
- History details with stored emission-factor traceability
## Tech Stack
 
**Frontend**
- React 19 + Vite
- Tailwind CSS
- Recharts
- Lucide React
**Backend**
- Node.js + Express
- MongoDB + Mongoose
- `mongodb-memory-server` (automatic local fallback when no `MONGODB_URI` is set)
**Deployment**
- Frontend: Vercel
- Backend: any Node host (Render, Railway, Fly.io, etc.) + MongoDB Atlas
## How CO2 Calculation Works
 
Both the frontend and backend use the same official emission factor per activity:
 
```
CO2 = Quantity × Emission Factor
```
 
Example:
 
- Car Travel: 10 km × 0.20 kg CO2/km = 2.00 kg CO2e
This is calculated and displayed in the logger and in the detailed history view for every saved activity, and recalculated server-side (never trusted from the client) when an activity is saved to MongoDB.
 
## Project Structure
 
```
PlanetPulse/
├── src/                          # Frontend (React + Vite)
│   ├── data/
│   │   └── emissionFactors.js    # centralized official activity definitions and categories
│   ├── services/
│   │   └── api.js                # fetch wrapper for the backend API
│   ├── utils/
│   │   └── planetPulse.js        # validation, storage, date logic, filtering, calculation helpers
│   ├── App.jsx                   # dashboard, activity logger, targets, patterns, and history
│   └── App.css                   # climate-tech design system and responsive layout
│
├── backend/                      # Backend (Express + MongoDB)
│   ├── config/database.js        # Mongo connection (Atlas or local, in-memory fallback in dev)
│   ├── models/
│   │   ├── Activity.js
│   │   └── Settings.js
│   ├── data/constants.js         # backend's copy of the official emission factors
│   ├── utils/helpers.js          # calculation, validation, week-range, settings helpers
│   ├── services/activityService.js
│   ├── routes/activityRoutes.js
│   ├── server.js                 # Express entry point
│   └── .env.example
│
└── DECISIONS.md                  # core product decisions (see below)
```
 
## API Reference
 
Base URL: `http://localhost:5000/api` (or your deployed backend URL)
 
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| POST | `/activities` | Log a new activity (`{ activityType, quantity }`) |
| GET | `/activities` | List activities, optional `?category=` and `?activityType=` filters |
| DELETE | `/activities/:id` | Delete an activity |
| GET | `/dashboard/weekly` | Weekly summary (`?referenceDate=` optional, defaults to server time) |
| GET | `/settings` | Get the current weekly target |
| PUT | `/settings` | Update the weekly target (`{ weeklyTarget }`) |
 
Example:
 
```bash
curl -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"activityType":"Car Travel","quantity":10}'
```
 
## Data Storage
 
PlanetPulse is localStorage-first: activities and the weekly target are always written to the browser so the app keeps working offline. When the backend is reachable, activities and settings are additionally persisted to MongoDB, and on load the app attempts to hydrate from the backend. If the backend call fails for any reason, the app silently falls back to whatever is already in localStorage — the UI never blocks on the network.
 
The app handles empty, missing, and malformed storage values safely and falls back to the default target when needed.
 
## Product Decisions
 
The project preserves the core product decisions captured in [DECISIONS.md](./DECISIONS.md):
 
1. Warn + encourage, never block, when the weekly target is exceeded.
2. Warn and require confirmation for unusual input values rather than silently correcting or rejecting them.
3. Use a Monday–Sunday local week model to keep weekly comparisons predictable and understandable.
## Limitations
 
- No authenticated user accounts — all activities in a given MongoDB database are shared, not scoped per user
- No external emissions data validation against a live third-party API
- Backend and frontend week calculations rely on their own local clocks; the frontend passes its local time to the dashboard endpoint to keep them aligned
## Future Scope
 
- User accounts and per-user data scoping
- Richer trend analysis
- Shareable weekly exports
- Verified external emissions datasets
- An AI-generated weekly insight/suggestion feature (currently, "Pulse Insight" and "Your Footprint Patterns" are rule-based, not model-generated)
## Getting Started
 
### Prerequisites
 
- Node.js 18+
- npm
- A MongoDB connection string (Atlas or local) — optional; the backend runs with an in-memory database if omitted in development
### Frontend
 
```bash
npm install
npm run dev
```
Open the local Vite URL shown in the terminal (typically `http://localhost:5173`).
 
### Backend
 
```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGODB_URI, PORT, CLIENT_URL
npm run dev
```
The API will be available at `http://localhost:5000`.
 
## Deployment
 
**Frontend** deploys easily to Vercel: push the repository, import it as a Vercel project, and deploy from the GitHub integration or via the Vercel CLI.
 
**Backend** can deploy to any Node host (Render, Railway, Fly.io):
1. Set `MONGODB_URI` to your Atlas connection string in the host's environment variables.
2. Set `CLIENT_URL` to your deployed frontend's origin (for CORS).
3. Do not commit `.env` files to GitHub.
## Contributing
 
Contributions are welcome.
 
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

 
## Hackathon Context
 
PlanetPulse was developed during a 5-hour hackathon conducted by [[Azisly.ai](./Azisly.ai)](https://azisly.ai/dashboard)], with a focus on building a functional, reliable, and user-friendly climate-tech solution.
 
## Acknowledgements
 
- Emission factor references: add your official source(s) here (e.g. IPCC, EPA, DEFRA)
- Icons: [Lucide](https://lucide.dev)
- Charts: [Recharts](https://recharts.org)
- Hosting: [Vercel](https://vercel.com)

- Special thanks to [[Azisly.ai](./Azisly.ai)](https://azisly.ai/dashboard)] for organizing the hackathon and providing the opportunity to build, innovate, and collaborate under real-world time constraints.
---
 
<p align="center">Made with 🌍 by the PlanetPulse team</p>
 
