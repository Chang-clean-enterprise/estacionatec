import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../src/config.js';
import { createDocumentClient } from '../src/db/client.js';
import { campusKey, parkingKey, slotKey } from '../src/db/keys.js';
import type { Campus, Parking, Slot } from '../src/models/types.js';

// Sample data: campus -> parking -> slots.
const campus: Campus = {
  campusId: 'cem',
  name: 'Campus Estado de México',
  city: 'Atizapán de Zaragoza',
};

// Each parking has its own slot count and a label prefix (e.g. PR-001).
const parkings: { parkingId: string; name: string; prefix: string; slots: number }[] = [
  { parkingId: 'preparatoria', name: 'Preparatoria', prefix: 'PR', slots: 40 },
  { parkingId: 'profesional', name: 'Profesional', prefix: 'PF', slots: 60 },
  { parkingId: 'piedritas', name: 'Piedritas', prefix: 'PD', slots: 30 },
];

const items: Record<string, unknown>[] = [];
const now = new Date().toISOString();

items.push({ ...campusKey(campus.campusId), ...campus });

for (const def of parkings) {
  const parking: Parking = {
    campusId: campus.campusId,
    parkingId: def.parkingId,
    name: def.name,
    totalSlots: def.slots,
  };
  items.push({ ...parkingKey(parking.campusId, parking.parkingId), ...parking });

  for (let n = 1; n <= def.slots; n++) {
    const slotId = String(n).padStart(3, '0');
    const slot: Slot = {
      campusId: parking.campusId,
      parkingId: parking.parkingId,
      slotId,
      label: `${def.prefix}-${slotId}`,
      status: Math.random() < 0.4 ? 'available' : 'occupied',
      updatedAt: now,
    };
    items.push({ ...slotKey(slot.campusId, slot.parkingId, slot.slotId), ...slot });
  }
}

const doc = createDocumentClient();
const BATCH_SIZE = 25; // DynamoDB BatchWriteItem limit

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  let requestItems: Record<string, { PutRequest: { Item: Record<string, unknown> } }[]> = {
    [config.tableName]: items.slice(i, i + BATCH_SIZE).map((Item) => ({ PutRequest: { Item } })),
  };

  // Retry unprocessed items (throttling) until the batch is fully written.
  while (Object.keys(requestItems).length > 0) {
    const result = await doc.send(new BatchWriteCommand({ RequestItems: requestItems }));
    requestItems = (result.UnprocessedItems ?? {}) as typeof requestItems;
  }
}

console.log(`Seeded ${items.length} items into "${config.tableName}"`);
