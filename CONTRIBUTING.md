# 🤝 Contributing

The detailed contribution guide lives at [`docs/contributing.md`](docs/contributing.md). In short:

1. Read the architecture and security guides before changing behavior.
2. Keep changes focused and preserve authenticated ownership checks.
3. Never commit secrets, wallet credentials, databases, screenshots, or real profile data.
4. Run the backend tests and frontend build before opening a pull request.

```bash
python -m pytest backend/tests -q
cd frontend && npm run build
```

For the Discord integration, run `npm test` and `npm run lint` from `discord-bot/` when relevant.