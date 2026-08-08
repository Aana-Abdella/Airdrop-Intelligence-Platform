# 🤝 Contributing

[Documentation](README.md) / Contributing

Thank you for helping improve the project. Keep pull requests focused, testable, and honest about the boundary between shipped behavior and future direction.

## Before you start

1. Read [Architecture](architecture.md), [Security](security.md), and the relevant module guide.
2. Search existing issues and pull requests.
3. For a behavior change, describe the expected API/UI contract before coding.
4. Never include credentials, wallet secrets, real screenshots, or a database dump in a patch.

## Development workflow

```bash
git checkout -b concise-change-name
python -m pip install -r backend/requirements.txt
cd frontend && npm install
```

Make the smallest coherent change. Keep backend route contracts in Pydantic models, preserve authenticated ownership filters, and keep frontend HTTP behavior centralized in `frontend/src/api.js`.

## Validation

From the repository root:

```bash
python -m pytest backend/tests -q
```

From `frontend/`:

```bash
npm run build
```

When documentation changes, also check relative links and scan examples for secrets. If a test or build cannot run, explain why in the pull request.

## Documentation standards

- Use the icon system intentionally; do not decorate every paragraph.
- Prefer short paragraphs, tables, diagrams, and task-oriented headings.
- Label capabilities as **Shipped**, **Helper**, **Sample**, **Prototype**, or **Roadmap** where ambiguity is possible.
- Document the actual command, endpoint, field, and UI label.
- Use screenshot placeholders instead of fabricated screenshots.
- Say explicitly when a UI label is not backed by a live integration.
- Update configuration, security, architecture, and changelog documentation when behavior changes.

## Pull request checklist

- [ ] Scope and motivation are clear.
- [ ] Ownership and authentication behavior remain correct.
- [ ] Tests cover changed backend behavior.
- [ ] Frontend build succeeds when frontend code changed.
- [ ] No secrets, databases, screenshots, or generated artifacts are included.
- [ ] Documentation matches the checked-in behavior.
- [ ] Limitations and follow-up work are called out.

## Issue reports

Include the smallest reproducible example, exact command/request, expected result, actual result, environment, and sanitized logs. Do not attach `backend/aws.db`, screenshots, `.env` files, tokens, or personal profile data.

---

[← FAQ](faq.md) · [Roadmap →](roadmap.md)
