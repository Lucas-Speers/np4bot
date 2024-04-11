import type { TextChannel } from "discord.js";

const { SaveData } = require("../utils");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Deletes thread and stops tracking"),
    async execute(interaction: {channelId: number; reply: any}, save: any) {
        for (let i in save.user_data) {
            if (save.user_data[i].guild_thread.id == interaction.channelId) {
                (save.user_data[i].guild_thread as TextChannel).delete();
                save.user_data.splice(i, 1);
                return;
            }
        }
        await interaction.reply({ content: "This command should be run in a thread that is tracking a game", ephemeral: true } as any);
    }
}