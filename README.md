# PlanetPulse

Know your footprint. Shape your choices.

## Problem

Most people understand that everyday choices have environmental impact, but the cost is usually hidden behind vague assumptions and unclear units. PlanetPulse makes personal footprint data visible, understandable, and actionable.

## Solution

PlanetPulse is a premium climate-tech dashboard for tracking weekly carbon impact from daily activities such as travel, electricity use, meals, and waste. It transforms routine decisions into transparent, weekly insights without requiring a backend or login.

## Core Features

- Activity logging for transport, electricity, meals, and waste
- Official emission-factor calculations with transparent formula display
- Weekly target tracking with a supportive over-target experience
- Weekly dashboard summaries, pattern insights, and 7-day footprint bars
- History with activity and date filtering
- localStorage persistence across refreshes
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

- React
- Vite
- JavaScript
- Recharts
- Lucide React
- localStorage
- Vercel

## How CO2 Calculation Works

The app uses the stored emission factor for each activity:

CO2 = Quantity × Emission Factor

Example from the app:

- Car Travel: 10 km × 0.20 kg CO2/km = 2.00 kg CO2e

This is calculated and displayed in the logger and in the detailed history view for every saved activity.

## Architecture

- src/data/emissionFactors.js — centralized official activity definitions and categories
- src/utils/planetPulse.js — validation, storage, date logic, filtering, and calculation helpers
- src/App.jsx — dashboard, activity logger, targets, patterns, and history
- src/App.css — climate-tech design system and responsive layout
- localStorage — browser persistence for stored activities and target values

## Data Storage

PlanetPulse stores activity and target data in browser localStorage. This keeps the application lightweight and fully functional without a backend or account system. The app handles empty, missing, and malformed storage values safely and falls back to the default target when needed.

## Product Decisions

The project preserves the core product decisions captured in DECISIONS.md:

1. Warn + encourage, never block, when the weekly target is exceeded.
2. Warn and require confirmation for unusual input values rather than silently correcting or rejecting them.
3. Use a Monday–Sunday local week model to keep weekly comparisons predictable and understandable.

## Limitations

- no cloud sync or cross-device persistence
- no authenticated user accounts
- no external emissions data validation or API integration
- no database or server-side data layer

## Future Scope

- optional cloud sync
- account-based history and reporting
- richer trend analysis
- shareable weekly exports
- verified external emissions datasets

## Deployment

PlanetPulse is designed to deploy easily to Vercel. After pushing the repository, connect it to a Vercel project and deploy the app from the GitHub integration or via the Vercel CLI.

## Local Development

1. npm install
2. npm run dev
3. Open the local Vite URL shown in the terminal

## Hackathon Context

This project was developed as a focused, no-backend climate-tracking product that prioritizes transparency, trust, and actionability over complexity.
