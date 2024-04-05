import { REST, Routes } from 'discord.js';
import {readdirSync} from "fs";
import {join} from "path";

var should_exit = false;

if (process.env.APP_ID == undefined) {
	console.error("APP_ID is not defined in `.env.local`");
	should_exit = true;
}
if (process.env.DISCORD_TOKEN == undefined) {
	console.error("DISCORD_TOKEN is not defined in `.env.local`");
	should_exit = true;
}

if (should_exit) {process.exit(1)}

const commands = [];

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.APP_ID as string),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
