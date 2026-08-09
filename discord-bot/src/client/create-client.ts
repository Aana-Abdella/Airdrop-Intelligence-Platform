import { Client, Events, GatewayIntentBits } from 'discord.js';
import type { ApiClient } from '../api/client.js';
import { commandMap } from '../commands/index.js';
import { interactionCreateHandler } from '../events/interaction-create.js';
import { readyHandler } from '../events/ready.js';
import type { Logger } from '../logging/logger.js';

export interface ClientDependencies {
  readonly api: ApiClient;
  readonly logger: Logger;
  readonly commandRegistry?: ReturnType<typeof commandMap>;
}

export function createDiscordClient(dependencies: ClientDependencies): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const registry = dependencies.commandRegistry ?? commandMap();
  const context = { api: dependencies.api, logger: dependencies.logger };

  client.once(Events.ClientReady, readyHandler(dependencies.logger));
  client.on(Events.InteractionCreate, interactionCreateHandler(registry, context));
  client.on(Events.Error, (error) =>
    dependencies.logger.error('Discord client error', { errorName: error.name }),
  );
  client.on(Events.Warn, (message) =>
    dependencies.logger.warn('Discord client warning', { message }),
  );

  return client;
}
