#!/usr/bin/env bash
# Builds and deploys EstacionaTec to AWS.
#
# Usage (from repo root):
#   ARTIFACTS_BUCKET=my-artifacts-bucket STAGE=dev npm run deploy
#
# Requires: AWS CLI v2 with credentials, an existing S3 bucket for Lambda artifacts.
set -euo pipefail

: "${ARTIFACTS_BUCKET:?Set ARTIFACTS_BUCKET to an existing S3 bucket for Lambda artifacts}"
STAGE="${STAGE:-dev}"
STACK_NAME="${STACK_NAME:-estacionatec-${STAGE}}"
REGION="${AWS_REGION:-us-east-1}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Building backend Lambda bundle"
npm run build -w backend

echo "==> Packaging template"
aws cloudformation package \
  --region "$REGION" \
  --template-file infra/template.yaml \
  --s3-bucket "$ARTIFACTS_BUCKET" \
  --s3-prefix "$STACK_NAME" \
  --output-template-file infra/.packaged.yaml

echo "==> Deploying stack $STACK_NAME"
aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --template-file infra/.packaged.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "Stage=$STAGE" \
  --no-fail-on-empty-changeset

output() {
  aws cloudformation describe-stacks \
    --region "$REGION" \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

API_URL="$(output ApiUrl)"
BUCKET="$(output FrontendBucketName)"
DISTRIBUTION_ID="$(output DistributionId)"
WEBSITE_URL="$(output WebsiteUrl)"

echo "==> Building frontend against $API_URL"
VITE_API_URL="$API_URL" npm run build -w frontend

echo "==> Uploading frontend to s3://$BUCKET"
aws s3 sync frontend/dist "s3://$BUCKET" --delete --region "$REGION"

echo "==> Invalidating CloudFront cache"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" >/dev/null

echo "Done."
echo "  Website: $WEBSITE_URL"
echo "  API:     $API_URL"
