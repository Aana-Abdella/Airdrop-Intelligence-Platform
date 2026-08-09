# Discord Bot Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository owner's private security-reporting channel or GitHub Security Advisories. Include impact, affected revision, reproduction steps, and a safe proof of concept. Do not include real tokens, private keys, seed phrases, or user data.

## Supported scope

Security fixes target the current default branch. Deployment operators should keep Node.js and npm dependencies patched and rotate credentials after suspected exposure.

## Security guarantees and boundaries

- Secrets are environment-injected, ignored by Git, validated at startup, and never intentionally logged.
- Structured log context redacts credential-related keys recursively.
- Production APIs require HTTPS; insecure HTTP is restricted to explicit localhost development.
- The Discord client requests only the `Guilds` intent and should not receive Administrator permission.
- Backend failures become generic user messages with an interaction reference; raw internals remain out of Discord.
- GET requests use bounded retry/backoff for transient failures; mutations are not automatically retried.
- API responses are untrusted and must be validated in service modules before Discord rendering.

The bot must never ask for platform passwords, wallet private keys, recovery phrases, seed phrases, or transaction signatures without a separately reviewed wallet-connect design. Account linking must use backend-issued, short-lived, single-use challenges bound to both the authenticated platform user and Discord identity. Store only Discord IDs and verification metadata needed by the platform.

## Known integration gaps

The current FastAPI backend has user JWT authentication but no scoped bot credential, Discord identity model, account-link challenge endpoints, leaderboard/points API, dedicated quest endpoint, admin RBAC, or notification subscription/delivery-state model. Those features must be designed and reviewed before corresponding commands are enabled. `API_KEY` is reserved and is not proof that such authentication exists.

## Deployment checklist

- Store the Discord token and future API credentials in a secret manager.
- Rotate credentials regularly and immediately after exposure.
- Restrict outbound network access to Discord and the platform API.
- Register commands through a controlled deployment step.
- Do not grant Administrator or privileged gateway intents.
- Review logs, dependency advisories, rate-limit behavior, and command permissions.
- Back up and protect backend data independently; this bot does not own the database.
