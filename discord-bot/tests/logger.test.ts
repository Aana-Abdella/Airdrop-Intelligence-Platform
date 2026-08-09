import { describe, expect, it, vi } from 'vitest';
import { createLogger } from '../src/logging/logger.js';

describe('createLogger', () => {
  it('redacts sensitive context recursively', () => {
    const info = vi.fn();
    const sink = { debug: vi.fn(), info, warn: vi.fn(), error: vi.fn() };
    createLogger('info', sink).info('configured', {
      token: 'secret',
      nested: { authorization: 'Bearer secret' },
      count: 2,
    });
    const output = String(info.mock.calls[0]?.[0]);
    expect(output).not.toContain('secret');
    expect(output).toContain('[REDACTED]');
    expect(output).toContain('"count":2');
  });
});
