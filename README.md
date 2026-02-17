# 🍎 Foodbank Check-In & Appointment System — Portfolio Repo

Portfolio snapshot of a client check-in experience and its admin dashboard. This repository includes **the client and admin frontends only**. The backend service is not included here.

🌐 **Live Client Preview:** [https://foodbank-checkin-tan.vercel.app/](https://foodbank-checkin-tan.vercel.app/)  
🛠️ **Live Admin Preview:** [https://foodbank-checkin-oj8m.vercel.app/](https://foodbank-checkin-oj8m.vercel.app/)  
📄 **CSV Upload:** [https://foodbank-checkin-oj8m.vercel.app/csv-upload](https://foodbank-checkin-oj8m.vercel.app/csv-upload)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-5B70FF?logo=chakraui&logoColor=white)](https://chakra-ui.com/)
[![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Proprietary](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

## System scope (full product)

This software is a **three‑tier check‑in system**:

- **Client UI** for check‑ins (this repo)
- **Admin UI** for operations and CSV workflows (this repo)
- **Backend API + data services** (not included here)

The backend is intentionally excluded for IP reasons, but the frontends are wired to integrate with it via `VITE_API_BASE_URL`. This README describes the **full system**, and points to **code examples** in this repo where relevant.

## Problem domain & solution (UI scope)

Food banks need a fast, consistent way to check in clients and manage daily appointment data. This UI snapshot shows:

- A guided, multilingual client check‑in flow (5 steps).
- An admin dashboard for CSV upload, status checks, and daily operations.
- Clear pathways for help requests and ticket printing workflows.

## What’s in this repo (factual scope)

- **Client app** in `client/` (check‑in flow UI).
- **Admin app** in `admin/` (dashboard, CSV upload UI, admin workflow).
- **Docs + samples** in `docs/` (architecture notes, data flow, sanitized CSV example).
- **Screenshots** in `assets/`.

Additional docs:

- `docs/engineering-notes.md`
- `docs/security-notes.md`
- `docs/ops-notes.md`

## Capabilities (full system, with repo evidence)

### Client app (implemented here)

- 5-step check-in flow: landing, initial check-in, special requests, appointment details, confirmation.
- Multi-language UI via i18next.
- Form validation and error handling.
- Accessibility-first Chakra components.
- Performance telemetry via Vercel Analytics + Speed Insights.

### Admin app (implemented here)

- Dashboard with quick actions, status panels, and analytics.
- CSV upload interface with sample data guidance.
- Client search and detail views.
- Check-in list management and ticket printing UI.
- Supabase-based admin authentication wiring.

### Backend services (described here, not included)

- Appointment validation and check‑in APIs
- CSV ingestion + normalization
- Ticket rendering and printing endpoints
- Admin‑protected endpoints for client updates and rebooking

## Architecture (full system)

This is a **three-tier, API-driven** system:

- **Presentation tier:** React client + admin UIs.
- **Application tier:** Backend API (not included in this repo).
- **Data tier:** Supabase + CSV ingestion (backend-owned).

The frontends communicate with an API base configured via environment variables. The admin API client includes a safe “API not configured” fallback for demo environments.

## Backend expectations (from UI contracts in this repo)

These are the backend capabilities **implied by the UI code** (examples from admin/client API usage):

- Check‑in lookup and validation endpoints (client flow)
- CSV upload + status endpoints (admin dashboard + upload)
- Check‑in list + analytics data endpoints (admin dashboard)
- Ticket printing endpoints (admin actions)
- Help request endpoints (admin help table)

Backend implementations are not included here; these are **requirements derived from the UI layer**.

## Design system & UX implementation (from code)

- **Chakra UI design system** across client/admin for consistent spacing, color, and typography.
- **Responsive layouts** optimized for kiosks, tablets, and phones.
- **Accessibility‑first components** with labels, focus states, and keyboard navigation.
- **Reusable layout primitives** used across the check‑in flow and admin panels.

## Tech stack (from `package.json`)

**Client:** React 18, TypeScript, Vite, Chakra UI, i18next, Framer Motion, Vercel Analytics  
**Admin:** React 18, TypeScript, Vite, Chakra UI, Supabase JS, Recharts, date-fns  
**Testing scripts (available):** Vitest + Cypress

## Backend capabilities (system-level, from requirements)

- **Link2Feed‑ready CSV ingestion** workflow (admin upload + status checks).
- **Check‑in validation** for appointment lookup and time window rules.
- **Admin‑protected endpoints** for client updates and rebooking flows.
- **Ticket rendering/printing endpoints** for operational workflows.

These are described to reflect the full product scope while keeping backend code private.

## Design + implementation strengths (evidence-based)

- Consistent layout and spacing via shared layout components.
- Feature-scoped components under `admin/src/components/features/*`.
- Centralized API layer in `admin/src/lib/api.ts` and `client/src/lib/api.ts`.
- Explicit localization wiring in the client app.

## Project structure

```text
client/
admin/
docs/
assets/
```

## Running locally

```bash
cd client && npm install && npm run dev
cd admin && npm install && npm run dev
```

## Demo notes

- **Admin login:** `admin@example.com` / `testing123`
- **Sample CSV:** `docs/sample-format.csv`
- **Date requirement:** Update all appointment dates in the sample CSV to **today’s date** before uploading, or the UI will show “no data.”

## Privacy & IP

This repo contains UI code only. Backend controllers, scheduling logic, and data services are proprietary and excluded from this snapshot.

## Operational tooling (in repo)

- Client telemetry: Vercel Analytics + Speed Insights
- Admin: Supabase auth wiring + structured API client with timeouts
- Backend monitoring/logging: not present in this repo

## Code examples (evidence from this repo)

- Client app routing: `client/src/App.tsx`
- i18n configuration: `client/src/shared/config/i18n.ts`
- Admin API client: `admin/src/lib/api.ts`
- Admin dashboard features: `admin/src/components/features/dashboard/*`
