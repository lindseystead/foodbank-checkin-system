# Security notes

## Frontend (this repo)

- Admin auth is Supabase-managed (PKCE); tokens never belong in git.
- API client sends `Authorization: Bearer` only when a session exists.
- No service-role keys in this repository.
- Vite env vars are build-time; treat anything `VITE_*` as public.

## Backend (private repository)

- Helmet, CORS allowlists, and rate limiting
- JWT checks on staff routes, with a separate volunteer role
- Day-of appointment rows expire after about 24 hours
- Client profiles are a separate store and are not deleted on that timer
