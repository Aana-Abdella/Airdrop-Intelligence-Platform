import { EmbedBuilder } from 'discord.js';

export const BRAND_COLOR = 0x6d5dfc;

export function brandedEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setDescription(description ?? null)
    .setFooter({ text: 'Airdrop-Intelligence-Platform' })
    .setTimestamp();
}

export function errorEmbed(message: string, reference: string): EmbedBuilder {
  return brandedEmbed('Unable to complete that request', message)
    .setColor(0xed4245)
    .addFields({ name: 'Reference', value: `\`${reference}\`` });
}
