import { CreateTableCommand, ResourceInUseException } from '@aws-sdk/client-dynamodb';
import { config } from '../src/config.js';
import { createDynamoClient } from '../src/db/client.js';

// Creates the table in dynamodb-local. In AWS the table is created by CloudFormation.
const client = createDynamoClient();

try {
  await client.send(
    new CreateTableCommand({
      TableName: config.tableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
    }),
  );
  console.log(`Table "${config.tableName}" created`);
} catch (err) {
  if (err instanceof ResourceInUseException) {
    console.log(`Table "${config.tableName}" already exists`);
  } else {
    throw err;
  }
}
