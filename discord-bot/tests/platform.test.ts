import { describe, expect, it } from 'vitest';
import { PlatformService } from '../src/services/platform.js';

describe('PlatformService', () => {
  it('validates the existing authenticated-user response', async () => {
    const api = {
      request: () =>
        Promise.resolve({
          id: 7,
          username: 'farmer',
          created_at: '2026-08-09T15:00:00Z',
        }),
    };
    const service = new PlatformService(api as never);
    await expect(service.currentUser('jwt')).resolves.toMatchObject({ id: 7 });
  });

  it('rejects malformed authenticated-user responses', async () => {
    const api = { request: () => Promise.resolve({ id: '7' }) };
    const service = new PlatformService(api as never);
    await expect(service.currentUser('jwt')).rejects.toThrow('Invalid user response');
  });
});
