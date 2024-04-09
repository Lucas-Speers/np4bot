import type { Collection } from "discord.js";

export class PlayerData {
    code!: string;
    game_number!: number;
    guild_thread: any;
    last_api!: JSON;
    time: any;
    next_tick_wait!: number;
    user_id!: number;
    game_started!: boolean;
    game_just_started!: boolean;
    update!: boolean;
    known_attacks!: { a: number; b: number; }[];

    public constructor(
        code: string,
        game_number: number,
        guild_thread: any,
        last_api: JSON,
        time: any,
        next_tick_wait: number,
        user_id: number,
        game_started: boolean,
        game_just_started: boolean,
        update: boolean,
        known_attacks: { a: number; b: number; }[]
    ) {
        
    }
}

export class SaveData {
    player_data!: PlayerData[];
}

export function save(data: SaveData) {

}

export function load(): SaveData {

    return new SaveData();
}

export async function get_api(data: any): Promise<any> {
    const full_url = `https://neptunespride4.appspot.com/api?${new URLSearchParams(data).toString()}`;
    const response = await fetch(full_url, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    });

    // used to track api usage so Jay doesn't get mad
    console.log(`Api usage ${data.code} ${data.game_number}`);

    return response.json();
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
