# PlanetPulse Backend

This backend adds a MongoDB-backed API layer for the PlanetPulse app while keeping the existing React frontend intact.

## Purpose

- Store activities persistently
- Calculate CO₂ using the existing PlanetPulse emission factors
- Support weekly dashboard summaries
- Manage a weekly target setting
- Keep the frontend working without a destructive migration

## Installation

```bash
cd backend
npm install
```

## Environment variables

Copy `.env.example` to `.env` and update the values as needed.

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/planetpulse
CLIENT_URL=http://localhost:5173
```

If `MONGODB_URI` is not available in local development, the app will automatically start an in-memory MongoDB instance for testing.

## Run locally

```bash
cd backend
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

## API endpoints

- `GET /api/health`
- `POST /api/activities`
- `GET /api/activities`
- `DELETE /api/activities/:id`
- `GET /api/dashboard/weekly`
- `GET /api/settings`
- `PUT /api/settings`

## Example request

```bash
curl -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"activityType":"Car Travel","quantity":10}'
```

## MongoDB setup

Use a local MongoDB instance or a cloud-hosted MongoDB connection string. The backend connects through Mongoose and reports the connection status in the startup logs.

## Frontend connection

The existing frontend remains localStorage-first. The backend is added underneath the app without replacing the current UI flow. A future frontend-to-backend integration can be done incrementally through a small API service layer.

## Deployment notes

- Configure `CLIENT_URL` for the deployed frontend origin.
- Set `MONGODB_URI` in the deployment environment.
- Do not commit `.env` files to GitHub.
