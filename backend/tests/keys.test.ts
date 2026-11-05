import { describe, expect, it } from 'vitest';
import { campusKey, parkingKey, slotKey } from '../src/db/keys.js';

describe('db keys', () => {
  it('builds a campus key', () => {
    expect(campusKey('mty')).toEqual({ PK: 'CAMPUS', SK: 'CAMPUS#mty' });
  });

  it('builds a parking key under its campus', () => {
    expect(parkingKey('mty', 'p1')).toEqual({ PK: 'CAMPUS#mty', SK: 'PARKING#p1' });
  });

  it('builds a slot key under its parking', () => {
    expect(slotKey('mty', 'p1', '001')).toEqual({
      PK: 'CAMPUS#mty#PARKING#p1',
      SK: 'SLOT#001',
    });
  });
});
