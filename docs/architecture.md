# Architecture Overview (Portfolio Snapshot)

This repository is a **UI‑only snapshot** intended for portfolio review. The architecture is designed to show senior‑level structure while omitting proprietary backend logic.

## 1) Client (React + Chakra + TypeScript)
- Five check‑in pages share `client/src/components/layout/PageLayout.tsx` and `ProgressSteps.tsx` to ensure consistent spacing, typography, and accessibility.
- Localization is wired via `client/src/common/i18n.ts` and `react-i18next.d.ts`.
- Network boundaries are mocked in `client/src/lib/api.ts` to demonstrate request/response shapes without exposing real endpoints.

## 2) Admin cockpit (React + Chakra)
- Admin functionality is segmented into `admin/src/components/features/*` to keep analytics, CSV upload, and client detail views isolated.
- Reusable layout and surface patterns live under `admin/src/components/ui` and `admin/src/layouts`.
- Mock data helpers are used where backend services are omitted.

## 3) Backend (omitted for IP protection)
- Controllers, services, and scheduling logic are intentionally excluded from this portfolio snapshot.
- UI surfaces are wired to mock helpers that emulate real responses.

