import { describe, expect, it } from 'vitest';
import { loadEnvironment } from '../src/config/env.js';

const valid = {
  DISCORD_TOKEN: 'test-token',
  DISCORD_CLIENT_ID: '123456789012345678',
  API_BASE_URL: 'https://api.example.com',
  NODE_ENV: 'test',
} satisfies NodeJS.ProcessEnv;

describe('loadEnvironment', () => {
  it('loads a secure minimal configuration', () => {
    expect(loadEnvironment(valid)).toMatchObject({
      LOG_LEVEL: 'info',
      NODE_ENV: 'test',
    });
  });

  it('fails without secrets or valid Discord IDs', () => {
    expect(() => loadEnvironment({ ...valid, DISCORD_TOKEN: '' })).toThrow(
      'DISCORD_TOKEN',
    );
    expect(() => loadEnvironment({ ...valid, DISCORD_CLIENT_ID: 'invalid' })).toThrow(
      'snowflake',
    );
  });

  it('requires explicit opt-in for local HTTP', () => {
    const local = { ...valid, API_BASE_URL: 'http://localhost:8000' };
    expect(() => loadEnvironment(local)).toThrow('HTTPS');
    expect(
      loadEnvironment({ ...local, ALLOW_INSECURE_LOCAL_API: 'true' }).API_BASE_URL,
    ).toBe(local.API_BASE_URL);
  });
});
