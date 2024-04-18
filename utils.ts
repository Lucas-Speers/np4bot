export class UserData {
    public code!: string;
    public game!: number;
    public guild_thread: string;
    public time: number;
    public next_tick_wait!: number;
    public user_id!: string;
    public game_started!: boolean;
    public update!: boolean;
    public known_attacks!: any;
    public players!: string[];

    public constructor(
        code: string,
        game: number,
        guild_thread: string,
        time: number,
        next_tick_wait: number,
        user_id: string,
        game_started: boolean,
        players: string[],
    ) {
        this.code = code;
        this.game = game;
        this.guild_thread = guild_thread;
        this.time = time;
        this.next_tick_wait = next_tick_wait;
        this.user_id = user_id;
        this.game_started = game_started;
        this.update = false;
        this.known_attacks = new Array();
        this.players = players;
    }
}

export function get_new_players(scanning_data: any, current_players: Array<String>) {
    let players = new Array();
    for (const [i, player] of Object.entries(scanning_data['players'])) {
        const alias = (player as any)['alias'];
        if ( alias != '' && current_players.indexOf(alias) == -1) {
            players.push(alias);
        }
    }
    return players;
}

export async function get_scanning_data(data: UserData) {
    const api_data = await get_api(data.game, data.code);
    const scanning_data = api_data['scanning_data'];

    // update info for api updating
    data.time = Date.now();
    data.next_tick_wait = update_next_tick_wait(scanning_data);

    return scanning_data;
}

export function should_get_api(data: UserData, grace: number) {
    if (data.update) {
        data.update = false;
        return true;
    }
    return (Date.now() - data.time) > (data.next_tick_wait + grace);
}

export function update_next_tick_wait(scanning_data: any) {
    return scanning_data['config']['tickRate'] * 60 * 1_000 * (1-(scanning_data['tickFragment'] % 1));
}

export class SaveData {
    user_data!: UserData[];

    public constructor() {
        this.user_data = new Array();
    }
}

export async function save_to_file(data: SaveData) {
    await Bun.write("save.json", JSON.stringify(data));
}

export async function load_from_file(): Promise<SaveData> {
    const file = Bun.file("save.json");
    return JSON.parse(await file.text()) as SaveData;
}

export async function get_api(game: number, code: string): Promise<any> {

    let params = {
    	game_number: game,
    	api_version: "0.1",
    	code: code,
    };

    const full_url = `https://neptunespride4.appspot.com/api?${new URLSearchParams(params as any).toString()}`;
    const response = await fetch(full_url, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    });

    // used to track api usage so Jay doesn't get mad
    console.log(`Api usage ${code} ${Date.now()}`);

    return response.json();
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
