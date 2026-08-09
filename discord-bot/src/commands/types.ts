import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ApiClient } from '../api/client.js';
import type { Logger } from '../logging/logger.js';

export interface CommandContext {
  readonly api: ApiClient;
  readonly logger: Logger;
}

export interface BotCommand {
  readonly data: SlashCommandBuilder;
  execute(
    interaction: ChatInputCommandInteraction,
    context: CommandContext,
  ): Promise<void>;
}
