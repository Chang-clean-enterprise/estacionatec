import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '../config.js';

/** Low-level client. Uses dummy credentials when pointing at dynamodb-local. */
export function createDynamoClient(): DynamoDBClient {
  return new DynamoDBClient({
    region: config.region,
    ...(config.dynamoEndpoint && {
      endpoint: config.dynamoEndpoint,
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    }),
  });
}

export function createDocumentClient(client = createDynamoClient()): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
}
