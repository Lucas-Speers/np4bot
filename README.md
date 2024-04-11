# Neptune's Pride 4 Discord Bot

A discord bot to alert you to atacks in Neptune's Pride 4 using it's api. Writen in typescript using [Bun](https://bun.sh/)

## Install dependencies:

```bash
bun install
```

## Setup files:

`.env.local`
```
DISCORD_TOKEN=your_dicord_token_here
APP_ID=your_application_id_here
```

`save.json`
```json
{"user_data":[]}
```

## Deploy commands (only run once then your good):

```bash
bun deploy-commands.ts
```

## Running:

```bash
bun index.ts
```
