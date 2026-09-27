# PlanetPulse

Tagline: Know your footprint. Shape your choices.

## Problem Statement

Most people know their daily habits have environmental consequences, but carbon impacts are often hidden behind vague numbers and unclear units. PlanetPulse turns everyday activities into clear, understandable carbon insights so users can see how their choices accumulate over a week.

## Solution

PlanetPulse is a climate-tech dashboard that helps users:

- log daily activities such as travel, electricity use, meals, and waste
- calculate a transparent personal CO2 footprint using fixed emission factors
- compare weekly progress against a personal carbon target
- review recent history and filter log entries by activity and date
- understand which category contributes most to their footprint

## Features

- activity logging for all required categories
- deterministic emission calculations
- weekly target tracking and progress status
- target-exceeded warning without blocking logging
- unusually high-value confirmation flow
- localStorage persistence across refreshes
- filtered history with date and activity controls
- premium dashboard with category breakdown and empty-state design

## Tech Stack

- React + Vite
- JavaScript
- Recharts
- Lucide React
- localStorage

## How CO2 Calculation Works

Each activity uses a fixed emission factor from the official hackathon brief.

CO2 = quantity × emission factor

Example:

- Car Travel: 10 km × 0.20 kg CO2/km = 2.00 kg CO2e

The app stores the quantity, unit, emission factor, and calculated CO2 so each result is transparent and reproducible.

## Project Architecture

- src/data/emissionFactors.js — centralized activity definitions and official factors
- src/utils/planetPulse.js — validation, storage, date logic, filtering, and calculations
- src/App.jsx — dashboard, logging flow, target controls, and history UI
- src/App.css — responsive climate-tech styling and component system
- localStorage — browser-side persistence for activities and the weekly target

## How to Run Locally

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open the local Vite URL shown in the terminal.

## Deployment

This project is prepared for deployment to Vercel.

1. Initialize Git:
   git init
2. Stage files:
   git add .
3. Commit changes:
   git commit -m "Initial PlanetPulse release"
4. Create a Vercel project and connect the GitHub repository.
5. Deploy from the Vercel dashboard or with the Vercel CLI.

## Data Storage

PlanetPulse stores all user activity and target settings in browser localStorage. This keeps the app simple, fast, and fully functional without a backend or authentication layer.

## 3 Product Decisions

1. Warn + encourage, never block, when the weekly target is exceeded.
2. Warn and confirm unusually large entries instead of silently rejecting or changing them.
3. Use a Monday–Sunday local week window to give clean, predictable weekly tracking.

## Limitations

- no cloud sync or cross-device persistence
- no database-backed history
- no authentication or user accounts

## Future Scope

- richer insights and trend analysis
- export/share features
- optional cloud sync
- advanced comparison tools

## Hackathon Information

Hackathon ID: [REPLACE_WITH_ACTUAL_ID]

> Replace this placeholder with the real Hackathon ID before submission.
