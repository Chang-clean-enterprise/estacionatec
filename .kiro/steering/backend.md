---
inclusion: fileMatch
fileMatchPattern: 'backend/**'
---

# Backend guidelines (Express 5 + TypeScript)

## Stack

- Express 5, Node.js 22+, ESM (`"type": "module"`, `module: NodeNext`).
- Relative imports must include the `.js` extension (e.g. `import { config } from './config.js'`).
- AWS SDK v3: `@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb` (Document client).
- Local run with `tsx` (`npm run dev -w backend`), env loaded from `backend/.env` via `--env-file-if-exists`.
- AWS run: `src/lambda.ts` wraps the same app with `serverless-http`, bundled by `scripts/bundle.ts` (esbuild) to `dist/lambda/index.mjs` (ESM with a `createRequire` banner for CommonJS deps).

## Structure

- `src/app.ts` `createApp(repo)` builds the Express app. No side effects, no DB connection here.
- `src/server.ts` local entry point. `src/lambda.ts` Lambda entry point.
- `src/config.ts` the only place that reads `process.env`.
- `src/routes/` one router per resource. Routers receive the repository as a parameter.
- `src/repositories/` `ParkingRepository` interface + `DynamoParkingRepository` implementation. All DynamoDB access goes here.
- `src/db/keys.ts` PK/SK builders for the single-table design. `src/db/client.ts` SDK clients.
- `src/models/types.ts` domain types and type guards.
- `scripts/` local utilities (`createTable.ts`, `seed.ts`) and the Lambda bundler (`bundle.ts`).

## Rules

- Routes depend on the `ParkingRepository` interface, never on the SDK directly.
- Use `Query` with key conditions; do not use `Scan` in request paths. Handle pagination (`LastEvaluatedKey`).
- Strip `PK`/`SK` before returning items to clients.
- Validate request bodies and params at the route level; respond `400` with `{ message }` on invalid input, `404` when an entity does not exist.
- Express 5 forwards rejected promises to the error handler, so async handlers don't need try/catch unless they map a specific error.
- Never log or return secrets or stack traces to clients. The global error handler returns a generic 500.
- When adding a new DynamoDB action, also add it to the Lambda role policy in `infra/template.yaml`.
- `DYNAMODB_ENDPOINT` is only for dynamodb-local. Don't set it in AWS.

## Tests

- Vitest + supertest in `backend/tests/*.test.ts`. Run with `npm test -w backend`.
- Keep them unit-level: build the app with an in-memory fake `ParkingRepository`. Don't hit DynamoDB from tests.
