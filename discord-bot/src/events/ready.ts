import type { Client } from 'discord.js';
import type { Logger } from '../logging/logger.js';

export function readyHandler(logger: Logger) {
  return (client: Client<true>): void => {
    logger.info('Discord bot is ready', {
      discordUserId: client.user.id,
      guildCount: client.guilds.cache.size,
    });
  };
}
