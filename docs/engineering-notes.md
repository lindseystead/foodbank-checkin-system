# Engineering Notes (Portfolio Snapshot)

These notes summarize implementation decisions and system boundaries based on the code in this repository.

## Architecture (n-tier)
- Presentation: client and admin React apps (this repo).
- Application: backend API (not included).
- Data: Supabase + CSV ingestion (backend-owned).

## API contract boundary
- Frontends integrate through `VITE_API_BASE_URL`.
- Admin API client includes timeouts, auth token injection, and a safe fallback for demo mode.

## Client app highlights
- Five-step flow with form validation and i18n.
- Shared layout primitives for consistent spacing and accessibility.
- Vercel Analytics + Speed Insights enabled.

## Admin app highlights
- Modular feature folders for dashboard, CSV, clients, and check-ins.
- CSV upload flow and status panels.
- Check-in list and ticket printing UI wired to backend endpoints.
- Supabase auth wiring.

## Security posture (UI scope)
- No backend secrets stored in this repo.
- API base is environment-configured.

## What is intentionally excluded
- Backend controllers, data models, scheduling logic, and infrastructure.
