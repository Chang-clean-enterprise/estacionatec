import { config } from '../src/config.js';
import { createDocumentClient } from '../src/db/client.js';
import type { Slot, SlotStatus } from '../src/models/types.js';
import { DynamoParkingRepository } from '../src/repositories/parkingRepository.js';

/**
 * Parking activity simulator.
 *
 * Runs continuously (in the foreground) and, on each tick, flips the status of a
 * few random slots across every campus and parking. Useful for watching the UI
 * update live while developing. Stop it with Ctrl+C.
 *
 * Config via env vars:
 *   SIMULATE_INTERVAL_MS   time between ticks (default 3000)
 *   SIMULATE_CHANGES_PER_TICK  slots changed per tick (default 5)
 *
 * Example: SIMULATE_INTERVAL_MS=1000 npm run simulate -w backend
 */

const intervalMs = Number(process.env.SIMULATE_INTERVAL_MS ?? 3000);
const changesPerTick = Number(process.env.SIMULATE_CHANGES_PER_TICK ?? 5);

const repo = new DynamoParkingRepository(createDocumentClient(), config.tableName);

/** A slot location plus its current status, flattened across all parkings. */
interface SlotRef {
  campusId: string;
  parkingId: string;
  slotId: string;
  label: string;
  status: SlotStatus;
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function flip(status: SlotStatus): SlotStatus {
  return status === 'available' ? 'occupied' : 'available';
}

/** Loads every slot in the table, grouped flat so we can pick random ones. */
async function loadAllSlots(): Promise<SlotRef[]> {
  const refs: SlotRef[] = [];
  const campuses = await repo.listCampuses();

  for (const campus of campuses) {
    const parkings = await repo.listParkings(campus.campusId);
    for (const parking of parkings) {
      const slots = await repo.listSlots(campus.campusId, parking.parkingId);
      for (const slot of slots) {
        refs.push({
          campusId: slot.campusId,
          parkingId: slot.parkingId,
          slotId: slot.slotId,
          label: slot.label,
          status: slot.status,
        });
      }
    }
  }
  return refs;
}

let running = true;

async function tick(slots: SlotRef[]): Promise<void> {
  if (slots.length === 0) {
    console.warn('No slots found. Did you run `npm run db:init -w backend`?');
    return;
  }

  const changed = new Set<string>();

  for (let i = 0; i < changesPerTick; i++) {
    const ref = pickRandom(slots);
    if (!ref) break;

    const key = `${ref.campusId}/${ref.parkingId}/${ref.slotId}`;
    if (changed.has(key)) continue; // avoid flipping the same slot twice in one tick
    changed.add(key);

    const next = flip(ref.status);
    const updated: Slot | undefined = await repo.updateSlotStatus(
      ref.campusId,
      ref.parkingId,
      ref.slotId,
      next,
    );

    if (updated) {
      ref.status = updated.status; // keep our in-memory copy in sync
      console.log(
        `${new Date().toISOString()}  ${ref.campusId}/${ref.parkingId}/${ref.label}  -> ${updated.status}`,
      );
    }
  }
}

async function main(): Promise<void> {
  console.log(
    `Simulator started (table "${config.tableName}", every ${intervalMs}ms, ${changesPerTick} slots/tick). Ctrl+C to stop.`,
  );

  const slots = await loadAllSlots();
  console.log(`Loaded ${slots.length} slots across all campuses and parkings.`);

  // Foreground loop: wait for each tick to finish before scheduling the next.
  while (running) {
    await tick(slots);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// Graceful shutdown on Ctrl+C.
process.on('SIGINT', () => {
  console.log('\nStopping simulator...');
  running = false;
});

main().catch((err) => {
  console.error('Simulator failed:', err);
  process.exit(1);
});
