# Data Flow (UI Perspective)

## 1) Client check‑in flow
- Language selector → phone + last name → dietary inputs → appointment details → confirmation.
- UI requests are routed through `client/src/lib/api.ts` (mock helpers) so the experience remains realistic without live backend calls.
- Session state is maintained in browser storage to mirror a real multi‑step check‑in.

## 2) Admin operations
- Dashboard renders analytics panels and check‑in tables from mock helpers in `admin/src/lib/api.ts`.
- CSV upload is visual‑only in this snapshot; `docs/sample-format.csv` documents the input format.
- Client detail and check‑in tables display sanitized records with accessible controls.

## 3) Security & privacy
- No live Supabase keys or backend endpoints are stored in this repo.
- All data shown in the UI is synthetic and meant for demonstration only.

