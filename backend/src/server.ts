import { createApp } from './app.js';
import { config } from './config.js';
import { createDocumentClient } from './db/client.js';
import { DynamoParkingRepository } from './repositories/parkingRepository.js';

// Local development entry point (in AWS the app runs through src/lambda.ts).
const repo = new DynamoParkingRepository(createDocumentClient(), config.tableName);

createApp(repo).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`DynamoDB: ${config.dynamoEndpoint ?? `AWS (${config.region})`} / table ${config.tableName}`);
});
