# Ops & Deployment Notes (Portfolio Snapshot)

## Deployment model
- Client and admin are separate Vite apps.
- Both can be deployed as static assets (e.g., Vercel).
- Backend is a separate service and not included here.

## Environment configuration
- `VITE_API_BASE_URL` points the UI to the backend API.
- Optional Supabase env vars are used for admin auth wiring.

## Observability
- Client enables Vercel Analytics + Speed Insights.
- No backend logs or APM are included in this repo.

## Demo constraints
- API base may be intentionally unconfigured for UI-only demos.
- Admin API client handles “API not configured” gracefully.
