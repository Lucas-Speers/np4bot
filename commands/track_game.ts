const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("track")
        .setDescription("Tracks a new game"),
    async execute() {}
}