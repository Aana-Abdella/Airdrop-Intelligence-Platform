import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import { ApiError } from '../src/api/errors.js';

describe('ApiClient', () => {
  it('retries safe requests after server failures', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('{"detail":"busy"}', {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          '{"id":7,"username":"farmer","created_at":"2026-08-09T15:00:00Z"}',
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
      sleep: () => Promise.resolve(),
    });
    await expect(client.request('/auth/me')).resolves.toMatchObject({
      id: 7,
      username: 'farmer',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('normalizes authentication failures without retrying', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"detail":"invalid"}', { status: 401 }));
    const client = new ApiClient({ baseUrl: 'https://api.example.com', fetchImpl });
    await expect(client.request('/profile')).rejects.toMatchObject({
      code: 'AUTHENTICATION',
      status: 401,
    } satisfies Partial<ApiError>);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not retry mutations by default', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
      sleep: () => Promise.resolve(),
    });
    await expect(
      client.request('/steps/1/complete', { method: 'POST' }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
