# BCBot

## Installing on BCGOV Openshift

1. Create a redis deployment from a standard template: `helm install hubot-redis bitnami/redis -f redis-helm-values.yaml`
1. Create Hubot user on rocket.chat (if one doesn't exist already)
1. Create a secret containing the password of Hubot's rocket.chat account (if one doesn't exist already) with the name "rocketchat-bot-account-password" and the key "BOT_PASSWORD"
1. Use bc.yaml to create a build: `oc process -f bc.yaml --param-file=test.env --ignore-unknown-parameters | oc apply -f -`
1. Deploy with dc.yaml: `oc process -f dc.yaml --param-file=test.env --ignore-unknown-parameters | oc apply -f -`

## Quick Start

```
git clone https://github.com/RocketChat/hubot-rocketchat-boilerplate
cd hubot-rocketchat-boilerplate
npm install
```
Create a _.env_ file with content:

```
export ROCKETCHAT_URL=myserver.com
export ROCKETCHAT_USER=mybotuser
export ROCKETCHAT_PASSWORD=mypassword
export ROCKETCHAT_ROOM=general
export ROCKETCHAT_USESSL=true
```

Adjust the content to fit your server and user credentials. Make sure `myuser` has **BOT role** on the server, if you don't know what that means, ask your server administrator to set it up for you.

Then run the bot:

```
source .env
bin/hubot
```

On the server, login as a regular user (not the BOT user), go to GENERAL, and try:

```
mybotuser what time is it
```

OR

```
mybotuser rc version
```
`< TBD:  insert sample run screenshot >`

You can examine the source code of these two bots under the `/scripts` directory, where you can add your own bot scripts written in Javascript.

## Stable Versions

This demo uses [Hubot][hubot] v3 and [Rocketchat.Chat adapter][hubot-rocketchat]
v2, using the new [Rocketchat Node.js SDK][[sdk] for Rocket.Chat instances
0.60.0 onward.

Versions of `hubot-rocketchat` prior to v2 are incompatible with Hubot v3

Due to the v1 adapter's use of Coffeescript, extending classes in es6
javascript is troublesome.

This bot is written in es6 and intended to run on node v8+. To run a bot on
older versions of node would require compiling with babel to use the full es6
feature set.

Older versions of the adaptor (v0.*) are also incompatible with more recent
versions of Rocket.Chat (v0.35+). Please report an issue if you find specific 
version mismatches and we'll update this document.

## More Details

This is a boilerplate for making your own bots with Hubot and Rocket.Chat.

### Running Locally

When you're ready to connect the bot to an instance of Rocket.Chat

1. Create a user for the bot, with the role _bot_
2. Create an `./.env` file with the user and connection settings
3. Run `bin/hubot` script to connect to your local Rocket.Chat

The `local` npm script will read in the env file, so you can populate and modify
those settings easily (see [configuration](#configuration)). In production, they
should be pre-populated in the server environment.

### Running in Production

There are executables for different environments that all run the Hubot binary.

Before running make sure your production environment has the required 
environment variables for the adapter, url, user, name and pass. Or you can add
them after the launch command as switches, like `-a rocketchat`.

- `bin/hubot` unix binary
- `bin/hubot.cmd` in windows
- `Procfile` for Heroku

Env variables should be populated on the server before launching
(see [configuration](#configuration)). The launcher will also install npm
dependencies on every run, in case it's booting in a fresh container (this isn't
required when working locally).

More information on [deployment configs][deployment] here.

### Adding Scripts

Scripts can be added to the `./scripts` folder, or by installing node packages
and listing their names in the `external-scripts.json` array. There's an example
of each in this repo, but neither is required.

### Example Scripts

Two scripts are packaged with the boilerplate, as a demo for manual tests.
Each of the following will respond in a public channel if the bot username is
prefixed, or without the bot's name if in a DM.

- `what time is it` or `what's the time` - Tells you the time
- `rc version` - Gives you version info for Rocket.Chat and Hubot (two messages)

## Configuration

When running locally, we've used [`dotenv`][dotenv] to load configs from the
`./.env` file. That makes it easy for setting environment variables.

Please see [adapter docs for source of truth on environment variables][env].

## Contributions Welcome

Please see [our documentation on contributing][contributing], then
[visit the issues][issues] to share your needs or ideas.

