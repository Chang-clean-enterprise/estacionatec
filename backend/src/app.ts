import cors from 'cors';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { config } from './config.js';
import type { ParkingRepository } from './repositories/parkingRepository.js';
import { campusesRouter } from './routes/campuses.js';

/** Builds the Express app. The repository is injected so it can be faked in tests. */
export function createApp(repo: ParkingRepository): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/campuses', campusesRouter(repo));

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  };
  app.use(errorHandler);

  return app;
}
