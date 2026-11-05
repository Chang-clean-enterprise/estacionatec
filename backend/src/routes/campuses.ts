import { Router } from 'express';
import { isSlotStatus, type Slot, type SlotSummary } from '../models/types.js';
import type { ParkingRepository } from '../repositories/parkingRepository.js';

export function summarize(slots: Slot[]): SlotSummary {
  return {
    total: slots.length,
    available: slots.filter((s) => s.status === 'available').length,
  };
}

/** Routes mounted at /api/campuses. Express 5 forwards async errors to the error handler. */
export function campusesRouter(repo: ParkingRepository): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json({ campuses: await repo.listCampuses() });
  });

  router.get('/:campusId/parkings', async (req, res) => {
    res.json({ parkings: await repo.listParkings(req.params.campusId) });
  });

  router.get('/:campusId/parkings/:parkingId/slots', async (req, res) => {
    const slots = await repo.listSlots(req.params.campusId, req.params.parkingId);
    res.json({ slots, summary: summarize(slots) });
  });

  router.patch('/:campusId/parkings/:parkingId/slots/:slotId', async (req, res) => {
    const status: unknown = req.body?.status;
    if (!isSlotStatus(status)) {
      res.status(400).json({ message: "status must be 'available' or 'occupied'" });
      return;
    }

    const { campusId, parkingId, slotId } = req.params;
    const slot = await repo.updateSlotStatus(campusId, parkingId, slotId, status);
    if (!slot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }
    res.json({ slot });
  });

  return router;
}
