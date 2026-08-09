# Airdrop-Intelligence-Platform Discord Bot

Official Discord integration for Airdrop-Intelligence-Platform. This package is intentionally part of the repository and delegates platform business rules to the FastAPI backend.

## Current scope

This foundation provides a production-oriented Discord client, strict configuration, slash-command registration, a typed HTTP boundary, normalized errors, secret-redacted logs, branded embeds, tests, and `/help`.

Only `/help` is registered today. Airdrop, quest, profile, account-linking, points, leaderboard, notification, and administration commands are **not** advertised as working until secure backend contracts exist. The current backend uses user JWTs and has no Discord identity-linking flow, scoped bot service credential, leaderboard/points API, or dedicated quest resource.

## Architecture

```text
Discord interaction
  -> commands (Discord input and output only)
  -> services (use-case orchestration and response validation)
  -> api (HTTP, timeout, safe retries, normalized errors)
  -> existing FastAPI backend
```

- `src/commands`: slash-command definitions and handlers
- `src/events`: Discord lifecycle and interaction routing
- `src/services`: validated platform use cases
- `src/api`: backend transport and errors
- `src/config`: fail-fast environment loading
- `src/middleware`: centralized interaction failures
- `src/utils`: branded Discord UI
- `scripts`: command deployment
- `tests`: Vitest tests

The bot stores no passwords, wallet secrets, or business data. Future account linking must be implemented by a short-lived, one-time backend verification flow—not by collecting platform credentials in Discord.

## Requirements

- Node.js 20 or newer (Node.js 22 recommended)
- npm
- Discord application and bot in the [Discord Developer Portal](https://discord.com/developers/applications)
- Reachable Airdrop-Intelligence-Platform API

## Discord setup

1. Create an application and bot in the Developer Portal.
2. Reset/copy the bot token once and store it only in `.env` or a production secret manager.
3. Copy the application ID as `DISCORD_CLIENT_ID`.
4. Under OAuth2 URL Generator, select `bot` and `applications.commands`.
5. Grant only `View Channels`, `Send Messages`, and `Embed Links` where needed. Do not grant Administrator.
6. The runtime requests only the `Guilds` gateway intent; privileged intents are not required.

## Local development

```bash
cd discord-bot
npm ci
cp .env.example .env
```

Set real Discord credentials, then load the file into your current shell:

```bash
set -a
source .env
set +a
```

For a local backend, set:

```env
API_BASE_URL=http://localhost:8000
ALLOW_INSECURE_LOCAL_API=true
```

Then register commands and run:

```bash
npm run register-commands
npm run dev
```

Set `DISCORD_GUILD_ID` during development for near-immediate guild command updates. Omit it in production to register globally; global propagation may take time.

## Commands and validation

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

Compiled output is written to `dist/`. Run it with `npm start` after `npm run build`.

## Environment variables

| Variable                   | Required | Purpose                                                    |
| -------------------------- | -------- | ---------------------------------------------------------- |
| `DISCORD_TOKEN`            | yes      | Discord bot token                                          |
| `DISCORD_CLIENT_ID`        | yes      | Discord application ID                                     |
| `DISCORD_GUILD_ID`         | no       | Development registration scope                             |
| `API_BASE_URL`             | yes      | FastAPI base URL; HTTPS required except opted-in localhost |
| `API_KEY`                  | no       | Reserved for a future backend-issued scoped bot credential |
| `ALLOW_INSECURE_LOCAL_API` | no       | Allows `http://localhost` only; forbidden in production    |
| `LOG_LEVEL`                | no       | `debug`, `info`, `warn`, or `error`                        |
| `NODE_ENV`                 | no       | `development`, `test`, or `production`                     |

The project deliberately does not load `.env` through an application dependency. Use your process manager/secret manager in production; for local runs, export the file through your shell or use a compatible launcher.

## Production deployment

1. Run `npm ci`, all validation commands, and `npm run build` in CI.
2. Inject secrets from the deployment platform; never bake `.env` into an image.
3. Set `NODE_ENV=production` and an HTTPS `API_BASE_URL`.
4. Run one replica for the foundation. Introduce distributed coordination before scheduled notifications or stateful workers are scaled horizontally.
5. Run `node dist/scripts/register-commands.js` as a controlled release step, then `npm start`.
6. Monitor process exits and structured `warn`/`error` logs. Tokens and sensitive context keys are redacted.

## Troubleshooting

- **Configuration exits immediately:** check the named variable, numeric Discord IDs, and HTTPS policy.
- **Command is missing:** register it; use a guild ID during development; global registration is slower.
- **Discord login fails:** rotate the token if exposure is possible, then update the secret store.
- **API unavailable:** verify that the configured FastAPI deployment is reachable, TLS and network policy allow the request, and `API_BASE_URL` is correct. The current backend does not expose a health endpoint. Safe GET requests retry briefly; mutations do not retry automatically.
- **Feature absent:** inspect the current-scope section. Do not add Discord-side business logic to compensate for a missing backend endpoint.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
