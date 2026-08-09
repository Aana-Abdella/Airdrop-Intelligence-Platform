import { describe, expect, it } from 'vitest';
import { commandMap, commands } from '../src/commands/index.js';

describe('command registry', () => {
  it('publishes only implemented commands', () => {
    expect(commands.map((command) => command.data.name)).toEqual(['help']);
    expect(commandMap().get('help')).toBeDefined();
  });

  it('rejects duplicate command names', () => {
    expect(() => commandMap([commands[0]!, commands[0]!])).toThrow('Duplicate');
  });
});
