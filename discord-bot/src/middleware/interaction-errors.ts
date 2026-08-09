import type { ChatInputCommandInteraction } from 'discord.js';
import { apiErrorMessage } from '../api/errors.js';
import type { Logger } from '../logging/logger.js';
import { errorEmbed } from '../utils/embeds.js';

export async function handleInteractionError(
  interaction: ChatInputCommandInteraction,
  error: unknown,
  logger: Logger,
): Promise<void> {
  const reference = interaction.id;
  logger.error('Command execution failed', {
    reference,
    command: interaction.commandName,
    discordUserId: interaction.user.id,
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
  const response = {
    embeds: [errorEmbed(apiErrorMessage(error), reference)],
    ephemeral: true,
  } as const;
  if (interaction.deferred || interaction.replied)
    await interaction.editReply(response);
  else await interaction.reply(response);
}
