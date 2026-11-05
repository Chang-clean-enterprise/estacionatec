# estacionatec
App para saber en donde hay lugares de estacionamiento disponible

Web app to check available parking slots across the parking lots of each Tecnológico de Monterrey campus.

| Part       | Tech                                                        |
|------------|-------------------------------------------------------------|
| `frontend` | Vue 3, Vite, vue-router, TypeScript, Vitest                 |
| `backend`  | Express 5, TypeScript, AWS SDK v3 (DynamoDB), Vitest        |
| `infra`    | CloudFormation: DynamoDB, Lambda + HTTP API, S3 + CloudFront |

Data hierarchy: **campus → parking → slots**, stored in a single DynamoDB table (see `.kiro/steering/product.md`).

## Requirements

- Node.js 22+ and npm
- Docker (for local DynamoDB)
- AWS CLI v2 (only for deployment)

## Local development

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

npm run db:up      # dynamodb-local :8000 + dynamodb-admin :8001
npm run db:init    # create table + seed sample data (data is in-memory, re-run after restarting)
npm run dev        # API http://localhost:3000, web http://localhost:5173
```

DynamoDB admin UI: http://localhost:8001

## Turn off DB


```bash
npm run db:down      # Turn Off DB container
```


## Tests

```bash
npm test           # unit tests for backend and frontend
npm run build      # typecheck + build both workspaces
```

## Deploy to AWS

You need an existing S3 bucket for the Lambda artifacts.

```bash
ARTIFACTS_BUCKET=my-artifacts-bucket STAGE=dev AWS_REGION=us-east-1 npm run deploy
```

The script builds the backend, deploys `infra/template.yaml`, builds the frontend with the API URL from the stack outputs, uploads it to S3 and invalidates CloudFront. To load sample data in AWS, run the seed with `TABLE_NAME=estacionatec-dev` and without `DYNAMODB_ENDPOINT`.

## API

| Method | Path                                                        |
|--------|-------------------------------------------------------------|
| GET    | `/health`                                                   |
| GET    | `/api/campuses`                                             |
| GET    | `/api/campuses/:campusId/parkings`                          |
| GET    | `/api/campuses/:campusId/parkings/:parkingId/slots`         |
| PATCH  | `/api/campuses/:campusId/parkings/:parkingId/slots/:slotId` |
