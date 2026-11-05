import serverless from 'serverless-http';
import { createApp } from './app.js';
import { config } from './config.js';
import { createDocumentClient } from './db/client.js';
import { DynamoParkingRepository } from './repositories/parkingRepository.js';

// AWS Lambda entry point (API Gateway HTTP API -> Lambda -> Express).
// Created at module scope so the client is reused across warm invocations.
const repo = new DynamoParkingRepository(createDocumentClient(), config.tableName);

export const handler = serverless(createApp(repo));
