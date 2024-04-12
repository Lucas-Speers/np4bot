import {ActionRowBuilder, Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, TextChannel} from "discord.js";
import {readdirSync} from "fs";
import {join} from "path";
import { UserData, SaveData, get_api, load_from_file, save_to_file, sleep, update_next_tick_wait, should_get_api, get_scanning_data, get_new_players } from "./utils";

const save = await load_from_file() as SaveData;

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
    console.log("\x1b[32m" + `Ready! Logged in as ${c.user.tag}` + "\x1b[0m");
});

// commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching command "${interaction.commandName}" was found.`);
		return;
	} else {
		console.log("\x1b[32m" + `Running command ${interaction.commandName}` + "\x1b[0m");
	}

	try {
		await (command as any).execute(interaction, save);
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

			const gameIdInput = new TextInputBuilder()
				.setCustomId('gameIdInput')
				.setLabel('Game ID')
				.setMinLength(3)
				.setRequired(true)
				.setStyle(TextInputStyle.Short);

			const apiInput = new TextInputBuilder()
				.setCustomId('apiInput')
				.setLabel('API Key')
				.setMaxLength(12)
				.setMinLength(12)
				.setRequired(true)
				.setStyle(TextInputStyle.Short);

			modal.addComponents(
				new ActionRowBuilder().addComponents(gameIdInput) as any,
				new ActionRowBuilder().addComponents(apiInput) as any
			)

			await interaction.showModal(modal);
	}
});

// modal response
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId === 'trackingModal') {
		await interaction.reply({ content: "Tracking game!", ephemeral: true } as any);

		const game = interaction.fields.getTextInputValue('gameIdInput') as unknown as number;
		const code = interaction.fields.getTextInputValue('apiInput');

		const api_data = await get_api(game, code);
		const scanning_data = api_data['scanning_data'];

		const thread = await (interaction.channel as any).threads.create({
			name: scanning_data['name'],
			type: ChannelType.PrivateThread
		});

		await thread.members.add(interaction.member?.user.id);

		(thread as TextChannel).send(`Tracking game "${scanning_data['name']}"`);

		var data = new UserData(
			code,
			game,
			thread,
			Date.now(),
			update_next_tick_wait(scanning_data), // 1000 = 1 second
			interaction.member?.user.id as string,
			scanning_data['started'],
			get_new_players(scanning_data, new Array<String>)
		);
		save.user_data.push(data);

		save_to_file(save);

	}
});

await client.login(process.env.DISCORD_TOKEN);


while (true) {
	for (let user of save.user_data) {
		
		// check if scan data needs to be updated
		if (should_get_api(user, 15_000)) {
			
			var user_message = '';
			var important = false;
			
			// get scan data
			const scanning_data: any = await get_scanning_data(user);
			
			// check if game is running
			if (user.game_started) {
				// check for any notible things in scan data
				
			} else {
				//  or waiting for players
				const new_players = get_new_players(scanning_data, user.players);

				if (new_players.length == 1) {
					user_message += `New player joined: ${new_players[0]}`;
				} else if (new_players.length > 1) {
					user_message += `New players joined: ${new_players.join(', ')}`;
				}

				// check if game just started
				if (scanning_data['started']) {
					user.game_started = true;
					user_message += '\nYour game just started!';
					important = true;
				}
			}

			// send message to user
			if (user_message != '') {
				if (important) {
					user_message += ` <@${user.user_id}>`;
				}
				(user.guild_thread as TextChannel).send(user_message);
			}
			
			save_to_file(save);
		}
	}
	await sleep(30_000);
}