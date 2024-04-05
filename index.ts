import {Client, Collection, Events, GatewayIntentBits} from "discord.js";
import {readdirSync} from "fs";
import {join} from "path";

function sleep(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

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
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// iteraction code
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

client.login(process.env.DISCORD_TOKEN);
