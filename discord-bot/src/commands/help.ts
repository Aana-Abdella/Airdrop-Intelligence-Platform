import { SlashCommandBuilder } from 'discord.js';
import { brandedEmbed } from '../utils/embeds.js';
import type { BotCommand } from './types.js';

export const helpCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show Airdrop Intelligence bot help and availability'),
  async execute(interaction) {
    const embed = brandedEmbed(
      'Airdrop Intelligence Help',
      'Use Discord to access trusted platform workflows as they become available.',
    ).addFields(
      { name: 'Available now', value: '`/help` — show this guide' },
      {
        name: 'Integration status',
        value:
          'Airdrop, quest, account, points, and leaderboard commands are withheld until their secure backend contracts are available.',
      },
      {
        name: 'Safety',
        value:
          'The bot will never ask for your password, private key, recovery phrase, or seed phrase.',
      },
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
