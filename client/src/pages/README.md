*** Begin Patch
*** Delete File: portfolio-foodbank/client/src/pages/README.md
Rendered by the client router. These pages import layout components (`PageLayout`, `ProgressSteps`) and the mock API (`lib/api.ts`) to display consistent content without backend calls.

## Design Notes

- Shared `ProgressSteps` keeps indicators aligned across pages.
- Pages rely on placeholder API helpers to simulate appointment data.

