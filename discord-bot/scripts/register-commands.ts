import { REST, Routes } from 'discord.js';
import { commands } from '../src/commands/index.js';
import { loadEnvironment } from '../src/config/env.js';
import { createLogger } from '../src/logging/logger.js';

const environment = loadEnvironment();
const logger = createLogger(environment.LOG_LEVEL);
const definitions = commands.map((command) => command.data.toJSON());
const rest = new REST({ version: '10' }).setToken(environment.DISCORD_TOKEN);

const route = environment.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(
      environment.DISCORD_CLIENT_ID,
      environment.DISCORD_GUILD_ID,
    )
  : Routes.applicationCommands(environment.DISCORD_CLIENT_ID);

await rest.put(route, { body: definitions });
logger.info('Discord slash commands registered', {
  commandCount: definitions.length,
  scope: environment.DISCORD_GUILD_ID ? 'guild' : 'global',
});
