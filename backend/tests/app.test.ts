import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { Slot, SlotStatus } from '../src/models/types.js';
import type { ParkingRepository } from '../src/repositories/parkingRepository.js';

const slots: Slot[] = [
  { campusId: 'mty', parkingId: 'p1', slotId: '001', label: 'A-001', status: 'available', updatedAt: '' },
  { campusId: 'mty', parkingId: 'p1', slotId: '002', label: 'A-002', status: 'occupied', updatedAt: '' },
];

/** In-memory fake so tests never touch DynamoDB. */
const fakeRepo: ParkingRepository = {
  listCampuses: async () => [{ campusId: 'mty', name: 'Campus Monterrey', city: 'Monterrey' }],
  listParkings: async (campusId) => [{ campusId, parkingId: 'p1', name: 'Norte', totalSlots: 2 }],
  listSlots: async () => slots,
  updateSlotStatus: async (_c, _p, slotId, status: SlotStatus) => {
    const slot = slots.find((s) => s.slotId === slotId);
    return slot ? { ...slot, status } : undefined;
  },
};

const app = createApp(fakeRepo);

describe('API', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/campuses lists campuses', async () => {
    const res = await request(app).get('/api/campuses');
    expect(res.status).toBe(200);
    expect(res.body.campuses).toHaveLength(1);
  });

  it('GET /api/campuses/:campusId/parkings lists parkings', async () => {
    const res = await request(app).get('/api/campuses/mty/parkings');
    expect(res.status).toBe(200);
    expect(res.body.parkings[0].campusId).toBe('mty');
  });

  it('GET slots returns slots with an availability summary', async () => {
    const res = await request(app).get('/api/campuses/mty/parkings/p1/slots');
    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({ total: 2, available: 1 });
  });

  it('PATCH slot rejects an invalid status', async () => {
    const res = await request(app)
      .patch('/api/campuses/mty/parkings/p1/slots/001')
      .send({ status: 'broken' });
    expect(res.status).toBe(400);
  });

  it('PATCH slot returns 404 for an unknown slot', async () => {
    const res = await request(app)
      .patch('/api/campuses/mty/parkings/p1/slots/999')
      .send({ status: 'occupied' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });
});
