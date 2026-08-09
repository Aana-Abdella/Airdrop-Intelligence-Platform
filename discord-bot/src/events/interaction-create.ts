import type { ClientEvents } from 'discord.js';
import { handleInteractionError } from '../middleware/interaction-errors.js';
import type { BotCommand, CommandContext } from '../commands/types.js';

export function interactionCreateHandler(
  registry: ReadonlyMap<string, BotCommand>,
  context: CommandContext,
) {
  return async (interaction: ClientEvents['interactionCreate'][0]): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;
    const command = registry.get(interaction.commandName);
    if (!command) {
      context.logger.warn('Unknown registered command received', {
        command: interaction.commandName,
      });
      await interaction.reply({
        content: 'This command is not available. Try `/help`.',
        ephemeral: true,
      });
      return;
    }
    try {
      await command.execute(interaction, context);
    } catch (error) {
      await handleInteractionError(interaction, error, context.logger);
    }
  };
}
