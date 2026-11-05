---
inclusion: fileMatch
fileMatchPattern: ['infra/**', 'docker-compose.yml']
---

# Infrastructure guidelines (CloudFormation + local Docker)

## AWS architecture (`infra/template.yaml`)

- DynamoDB table `estacionatec-<Stage>` (on-demand, PK/SK strings, PITR and SSE enabled, `DeletionPolicy: Retain`).
- Lambda `estacionatec-<Stage>-api` (Node.js 22, arm64) running the Express app via `serverless-http`.
- API Gateway HTTP API (quick-create proxy to the Lambda). CORS is handled by Express, not by API Gateway, to avoid duplicate headers.
- Private S3 bucket + CloudFront distribution with Origin Access Control for the Vue SPA. 403/404 fall back to `/index.html`.
- `Stage` parameter (`dev` | `prod`) is used in all resource names.

## Deploying

- `ARTIFACTS_BUCKET=<existing-bucket> STAGE=dev npm run deploy` runs `infra/deploy.sh`:
  build backend → `aws cloudformation package` → `deploy` → build frontend with `VITE_API_URL` from stack outputs → `s3 sync` → CloudFront invalidation.
- The Lambda `Code` property is a local path (`../backend/dist/lambda`) rewritten to S3 by `cloudformation package`. Don't hardcode S3 keys.
- `infra/.packaged.yaml` is generated; never commit it.

## Rules

- Plain CloudFormation YAML (no SAM/CDK) unless the team decides otherwise.
- Least privilege: IAM policies list explicit actions scoped to specific resource ARNs. No `*` actions or resources.
- S3 buckets stay private (Block Public Access on); serve content only through CloudFront OAC.
- Use `!Sub` with `${AWS::Partition}`, `${AWS::Region}`, `${AWS::AccountId}` instead of hardcoding ARNs.
- Set log retention on every log group.
- Validate template changes (e.g. `cfn-lint infra/template.yaml`) before deploying. Deploying changes live AWS resources; confirm with the team first.

## Local environment (`docker-compose.yml`)

- `dynamodb-local` on `localhost:8000`, running `-sharedDb -inMemory` (data resets on restart).
- `dynamodb-admin` UI on `http://localhost:8001`.
- After `npm run db:up`, run `npm run db:init` to create the table and seed data.
- The local table name (`TABLE_NAME` in `backend/.env`) defaults to `estacionatec`.
