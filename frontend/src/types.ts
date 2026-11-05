// Keep in sync with backend/src/models/types.ts
export type SlotStatus = 'available' | 'occupied';

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
