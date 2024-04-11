const { SaveData } = require("../utils");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pings the bot"),
    async execute(interaction: { reply: (arg0: string) => any; }) {
        await interaction.reply({ content: "Pong!", ephemeral: true } as any);
    }
}