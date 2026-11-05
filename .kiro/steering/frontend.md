---
inclusion: fileMatch
fileMatchPattern: 'frontend/**'
---

# Frontend guidelines (Vue 3 + Vite + TypeScript)

## Stack

- Vue 3 with `<script setup lang="ts">` and the Composition API only (no Options API).
- Vite for dev/build, `vue-router` with `createWebHistory` (CloudFront has an SPA fallback to `index.html`).
- Type checking with `vue-tsc`. No state management library yet; add Pinia only if shared state becomes necessary.
- Plain scoped CSS. Global CSS variables (colors) live in `App.vue`.

## Structure

- `src/router.ts` routes mirror the data hierarchy: `/` → `/campus/:campusId` → `/campus/:campusId/parking/:parkingId`. Route params are passed as props.
- `src/views/` one view per route; views fetch data.
- `src/components/` presentational components; receive data through props, no API calls.
- `src/api/client.ts` the only place that calls `fetch`. Base URL comes from `VITE_API_URL`.
- `src/composables/` reusable logic (`useAsyncData` for loading/error state).
- `src/types.ts` mirror of `backend/src/models/types.ts`. Keep both in sync.

## Rules

- UI text in Spanish. Code in English.
- Always handle loading and error states in views (`role="status"` / `role="alert"`).
- Accessibility: semantic HTML (lists, headings, links), visible focus, and never convey slot status by color alone (always include a text label).
- URL-encode path params in API calls (`encodeURIComponent`).
- Env vars must be prefixed with `VITE_` and declared in `env.d.ts`. Never put secrets in frontend env vars; they end up in the bundle.
- Use the `@/` alias or relative imports consistently within a file.

## Tests

- Vitest + `@vue/test-utils` + jsdom in `frontend/tests/*.test.ts`. Run with `npm test -w frontend`.
- Keep them superficial: render components with props and assert on output; mock `fetch` with `vi.stubGlobal` for API client tests.
