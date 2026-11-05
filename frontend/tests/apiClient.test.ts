import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCampuses, getSlots } from '../src/api/client';

function mockFetch(body: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api client', () => {
  it('getCampuses unwraps the campuses list', async () => {
    mockFetch({ campuses: [{ campusId: 'mty', name: 'Campus Monterrey', city: 'Monterrey' }] });
    const campuses = await getCampuses();
    expect(campuses[0]?.campusId).toBe('mty');
  });

  it('getSlots calls the nested slots endpoint', async () => {
    const fetchMock = mockFetch({ slots: [], summary: { total: 0, available: 0 } });
    await getSlots('mty', 'p1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/campuses\/mty\/parkings\/p1\/slots$/),
    );
  });

  it('throws on non-2xx responses', async () => {
    mockFetch({}, false, 500);
    await expect(getCampuses()).rejects.toThrow('500');
  });
});
