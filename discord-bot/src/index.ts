import { ApiClient } from './api/client.js';
import { createDiscordClient } from './client/create-client.js';
import { loadEnvironment } from './config/env.js';
import { createLogger } from './logging/logger.js';

export const BOT_NAME = 'Airdrop-Intelligence-Platform';

const environment = loadEnvironment();
const logger = createLogger(environment.LOG_LEVEL);
const apiOptions = environment.API_KEY
  ? { baseUrl: environment.API_BASE_URL, apiKey: environment.API_KEY }
  : { baseUrl: environment.API_BASE_URL };
const api = new ApiClient(apiOptions);
const client = createDiscordClient({ api, logger });

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('Shutting down Discord bot', { signal });
  await client.destroy();
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', () => logger.error('Unhandled promise rejection'));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { errorName: error.name });
  void shutdown('uncaughtException').finally(() => process.exit(1));
});

try {
  await client.login(environment.DISCORD_TOKEN);
} catch (error) {
  logger.error('Discord login failed', {
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
  process.exitCode = 1;
}
