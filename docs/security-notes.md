# Security Notes (Portfolio Snapshot)

This repository is a UI-only snapshot. Backend security controls are described at a high level where the UI depends on them.

## UI-layer security
- Environment-based API base URL (`VITE_API_BASE_URL`) prevents hardcoding endpoints.
- Admin API client enforces timeouts and handles unauthorized responses.
- No production secrets are stored in this repo.

## Auth boundaries
- Admin UI is wired for Supabase authentication.
- Admin requests include bearer tokens from the Supabase session.

## Data handling
- CSV uploads and appointment data are handled by the backend (not included).
- UI validation is present for user input and form errors.

## Exclusions
- Backend auth middleware, DB schemas, and rate limiting live outside this repo.
