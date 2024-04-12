const { SaveData } = require("../utils");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Forces an API fetch"),
    async execute(interaction: {channelId: number; reply: any}, save: any) {
        for (let user of save.user_data) {
            if (user.guild_thread.id == interaction.channelId) {
                user.update = true;
                await interaction.reply({ content: "Updating... This could take up to 30 seconds", ephemeral: true } as any);
                return;
            }
        }
        await interaction.reply({ content: "This command should be run in a thread that is tracking a game", ephemeral: true } as any);
    }
}