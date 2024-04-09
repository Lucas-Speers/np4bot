import {ActionRow, ActionRowBuilder, Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, GuildTextThreadManager, ChannelManager, GuildChannelManager, ThreadChannel, ChannelType} from "discord.js";
import {readdirSync} from "fs";
import {join} from "path";
import { PlayerData, get_api, load } from "./utils";
import { sleep } from "./utils";

const save = load();

// var data = new PlayerData();
// data.code = "abc";
// data.game_number = 203;

// save.player_data.push();

// create a new Client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]});

// create map of commands
const commands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.set(command.data.name, command);
		console.log(`Loading command: ${command.data.name}`);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, (c) => {
    console.log("\x1b[32m", `Ready! Logged in as ${c.user.tag}`);
});

// commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching command "${interaction.commandName}" was found.`);
		return;
	}

	try {
		await (command as any).execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// modal
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'track') {
		const modal = new ModalBuilder()
			.setCustomId('trackingModal')
			.setTitle('Track Game');

			const apiInput = new TextInputBuilder()
				.setCustomId('apiInput')
				.setLabel('API Key')
				.setMaxLength(12)
				.setMinLength(12)
				.setRequired(true)
				.setStyle(TextInputStyle.Short);

			const gameIdInput = new TextInputBuilder()
				.setCustomId('gameIdInput')
				.setLabel('Game ID')
				.setMinLength(3)
				.setRequired(true)
				.setStyle(TextInputStyle.Short);

			modal.addComponents(
				new ActionRowBuilder().addComponents(apiInput) as any,
				new ActionRowBuilder().addComponents(gameIdInput) as any
			)

			await interaction.showModal(modal);
	}
});

// modal response
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId === 'trackingModal') {
		await interaction.reply({ content: "Tracking game!", ephemeral: true } as any);
		const thread = await (interaction.channel as any).threads.create({
			name: 'new thread',
			type: ChannelType.PrivateThread
		});

		await thread.members.add(interaction.member?.user.id);
	}
});

await client.login(process.env.DISCORD_TOKEN);


// while (true) {
// 	for (const player in save.player_data) {
// 		// check if scan data needs to be updated

// 		// get scan data

// 		// check if game if currently running or waiting for players

// 		// check if game just started

// 		// check for any notible things in scan data

// 		// send message to user
// 	}
// 	sleep(5_000);
// }

// let params = {
// 	game_number: 203,
// 	api_version: "0.1",
// 	code: "Usfb5HLmCSqt", // already invalidated by the time you're reading this
// };

// let result = await get(params);

// console.log(result);