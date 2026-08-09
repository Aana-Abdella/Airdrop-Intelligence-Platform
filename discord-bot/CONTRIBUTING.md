# Contributing to the Discord Bot

Thank you for improving the official Airdrop-Intelligence-Platform Discord integration.

## Ground rules

- Keep platform business rules in the backend. Commands validate Discord input, call services, and render responses.
- Keep HTTP details in `src/api`; validate untrusted API responses in `src/services`.
- Register only commands with verified end-to-end backend support.
- Never request or store passwords, private keys, seed phrases, recovery phrases, or broad administrator credentials.
- Use least-privilege Discord intents and permissions.
- Do not log tokens, authorization headers, API keys, credential-bearing URLs, or raw sensitive errors.
- Avoid new dependencies unless they materially improve safety or maintainability.

## Workflow

1. Create a focused branch and issue/description.
2. For API-backed features, document the existing endpoint and authentication contract. If absent, add the backend contract first.
3. Add or update tests for configuration, validation, permissions, failure behavior, and formatting logic.
4. Run:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

5. Keep pull requests small and describe security implications and manual Discord testing.

## Command pattern

Add a focused `BotCommand` module, expose it through `src/commands/index.ts`, orchestrate backend work through a service, and use shared embed/error helpers. Do not call `fetch` from command handlers.

Admin commands require both Discord permission checks and backend authorization. Role IDs alone are not a complete authorization model.

## Commit safety

Before committing, inspect staged files and run a secret scan. Never stage `.env`, generated `dist`, logs, SQLite databases, screenshots, or credentials.
