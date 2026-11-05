import type { Campus, Parking, Slot, SlotSummary } from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
  return (await res.json()) as T;
}

export async function getCampuses(): Promise<Campus[]> {
  return (await get<{ campuses: Campus[] }>('/api/campuses')).campuses;
}

export async function getParkings(campusId: string): Promise<Parking[]> {
  const path = `/api/campuses/${encodeURIComponent(campusId)}/parkings`;
  return (await get<{ parkings: Parking[] }>(path)).parkings;
}

export function getSlots(
  campusId: string,
  parkingId: string,
): Promise<{ slots: Slot[]; summary: SlotSummary }> {
  return get(
    `/api/campuses/${encodeURIComponent(campusId)}/parkings/${encodeURIComponent(parkingId)}/slots`,
  );
}
