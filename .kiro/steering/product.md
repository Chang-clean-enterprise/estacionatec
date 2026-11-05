---
inclusion: always
---

# EstacionaTec - project overview

Web app for Tecnológico de Monterrey students to see available parking slots in the different parking lots of each campus.

## Repository layout

- `frontend/` Vue 3 + Vite + TypeScript SPA (see `frontend.md` steering)
- `backend/` Express 5 + TypeScript API (see `backend.md` steering)
- `infra/` CloudFormation template and deploy script (see `infra.md` steering)
- `docker-compose.yml` local DynamoDB (`amazon/dynamodb-local` on :8000) and `aaronshaf/dynamodb-admin` (UI on :8001)
- npm workspaces monorepo. Run commands from the root using `-w backend` / `-w frontend`.

## Domain model (3 levels)

Campus → Parking → Slot. A slot status is `available` or `occupied`.

Stored in a single DynamoDB table with string keys `PK` / `SK`:

| Entity  | PK                                       | SK                    |
|---------|------------------------------------------|-----------------------|
| Campus  | `CAMPUS`                                 | `CAMPUS#<campusId>`   |
| Parking | `CAMPUS#<campusId>`                      | `PARKING#<parkingId>` |
| Slot    | `CAMPUS#<campusId>#PARKING#<parkingId>`  | `SLOT#<slotId>`       |

Every list is one `Query` on `PK` + `begins_with(SK, prefix)`. Never use `Scan` for API requests.
Key builders live in `backend/src/db/keys.ts`. Always use them instead of building keys inline.

## API contract

| Method | Path                                                         | Response                     |
|--------|--------------------------------------------------------------|------------------------------|
| GET    | `/health`                                                    | `{ status }`                 |
| GET    | `/api/campuses`                                              | `{ campuses: Campus[] }`     |
| GET    | `/api/campuses/:campusId/parkings`                           | `{ parkings: Parking[] }`    |
| GET    | `/api/campuses/:campusId/parkings/:parkingId/slots`          | `{ slots: Slot[], summary }` |
| PATCH  | `/api/campuses/:campusId/parkings/:parkingId/slots/:slotId`  | `{ slot }` body `{ status }` |

Types are defined in `backend/src/models/types.ts` and mirrored in `frontend/src/types.ts`. When changing one, update the other in the same change.

## Conventions

- TypeScript strict mode everywhere. Avoid `any`.
- Code, identifiers and comments in English. User-facing UI text in Spanish.
- Dependencies are pinned to exact versions (no `^` or `~`).
- TypeScript is pinned to 6.x because `vue-tsc` relies on the TypeScript JS API.
- Tests are superficial unit tests with Vitest only (no integration/e2e tests for now).

## Common commands (from repo root)

- `npm install` install all workspaces
- `npm run db:up` / `npm run db:down` start/stop local DynamoDB
- `npm run db:init` create the table and seed sample data (re-run after `db:up`, data is in-memory)
- `npm run dev` run API (:3000) and web (:5173) together
- `npm test` run all unit tests
- `npm run build` typecheck and build both workspaces
