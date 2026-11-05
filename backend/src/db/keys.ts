/**
 * Single-table key design (table: PK / SK, both strings).
 *
 *  Entity   | PK                                  | SK
 *  ---------|-------------------------------------|---------------------
 *  Campus   | CAMPUS                              | CAMPUS#<campusId>
 *  Parking  | CAMPUS#<campusId>                   | PARKING#<parkingId>
 *  Slot     | CAMPUS#<campusId>#PARKING#<parkId>  | SLOT#<slotId>
 *
 * Every list operation is a single Query on PK + begins_with(SK, prefix).
 */
export interface ItemKey {
  PK: string;
  SK: string;
}

export const CAMPUS_PARTITION = 'CAMPUS';
export const CAMPUS_PREFIX = 'CAMPUS#';
export const PARKING_PREFIX = 'PARKING#';
export const SLOT_PREFIX = 'SLOT#';

export const parkingPartition = (campusId: string): string => `CAMPUS#${campusId}`;

export const slotPartition = (campusId: string, parkingId: string): string =>
  `CAMPUS#${campusId}#PARKING#${parkingId}`;

export const campusKey = (campusId: string): ItemKey => ({
  PK: CAMPUS_PARTITION,
  SK: `${CAMPUS_PREFIX}${campusId}`,
});

export const parkingKey = (campusId: string, parkingId: string): ItemKey => ({
  PK: parkingPartition(campusId),
  SK: `${PARKING_PREFIX}${parkingId}`,
});

export const slotKey = (campusId: string, parkingId: string, slotId: string): ItemKey => ({
  PK: slotPartition(campusId, parkingId),
  SK: `${SLOT_PREFIX}${slotId}`,
});
