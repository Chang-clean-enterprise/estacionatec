/** Runtime configuration, read from environment variables. */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  region: process.env.AWS_REGION ?? 'us-east-1',
  tableName: process.env.TABLE_NAME ?? 'estacionatec',
  /** Set only for local development (dynamodb-local). */
  dynamoEndpoint: process.env.DYNAMODB_ENDPOINT,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
} as const;
