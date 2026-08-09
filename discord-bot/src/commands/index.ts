import type { BotCommand } from './types.js';
import { helpCommand } from './help.js';

export const commands: readonly BotCommand[] = [helpCommand];

export function commandMap(
  items: readonly BotCommand[] = commands,
): ReadonlyMap<string, BotCommand> {
  const entries = items.map((command) => [command.data.name, command] as const);
  if (new Set(entries.map(([name]) => name)).size !== entries.length)
    throw new Error('Duplicate Discord command name');
  return new Map(entries);
}
