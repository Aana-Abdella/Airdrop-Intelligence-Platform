# 🔐 Security Policy

## Supported versions

Security fixes are currently targeted at the `main` branch. This project is local-first and does not promise a public hosted service or guaranteed response time.

## Reporting a vulnerability

Please do not open a public issue for an unpatched vulnerability. Contact the maintainers through a private GitHub security advisory or the repository owner’s private contact channel with:

- affected commit, file, endpoint, or package;
- a concise description of impact;
- safe reproduction steps or a minimal proof of concept; and
- any mitigation you have identified.

Redact credentials, personal data, wallet secrets, database files, screenshots, and tokens. If a credential may have been exposed, revoke or rotate it first. Do not test against third-party protocols, mainnet funds, or accounts you do not own.

## Scope and safety boundary

The checked-in workflow stores public wallet metadata only. It must not be extended to collect seed phrases/private keys, bypass CAPTCHAs or access controls, evade rate limits, or submit unauthorized transactions. See [`docs/security.md`](docs/security.md) for the threat model and deployment checklist.