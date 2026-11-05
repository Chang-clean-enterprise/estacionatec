export const SLOT_STATUSES = ['available', 'occupied'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export interface Campus {
  campusId: string;
  name: string;
  city: string;
}

export interface Parking {
  campusId: string;
  parkingId: string;
  name: string;
  totalSlots: number;
}

export interface Slot {
  campusId: string;
  parkingId: string;
  slotId: string;
  label: string;
  status: SlotStatus;
  updatedAt: string;
}

export interface SlotSummary {
  total: number;
  available: number;
}

export function isSlotStatus(value: unknown): value is SlotStatus {
  return typeof value === 'string' && (SLOT_STATUSES as readonly string[]).includes(value);
}
