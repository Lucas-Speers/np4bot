export class UserData {
	static updateNextTickWait(scanning_data: any): number {
		throw new Error("Method not implemented.");
	}
    public code!: string;
    public game!: number;
    public guild_thread: any;
    public time: number;
    public next_tick_wait!: number;
    public user_id!: string;
    public game_started!: boolean;
    public update!: boolean;
    public known_attacks!: { a: number; b: number; }[];
    public players!: string[];

    public should_get_api(grace: number) {
        if (this.update) {
            this.update = false;
            return true;
        }
        return (Date.now() - this.time) > (this.next_tick_wait + grace);
    }

    public async get_scanning_data() {
        const api_data = await get_api(this.game, this.code);
        const scanning_data = api_data['scanning_data'];

        // update info for api updating
        this.time = Date.now();
        this.next_tick_wait = update_next_tick_wait(scanning_data);

        return scanning_data;
    }

    public constructor(
        code: string,
        game: number,
        guild_thread: any,
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
    console.log(`Api usage ${code} ${game}`);

    return response.json();
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
