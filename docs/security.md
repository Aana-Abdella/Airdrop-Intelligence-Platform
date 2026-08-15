# 🔐 Security Guide

[Documentation](README.md) / Security

This guide describes the security boundary of the checked-in application. It is not a security audit or a guarantee that the system is safe for public production deployment.

> [!WARNING]
> This project is a local-first open-source workflow prototype. Review the threat model, replace development defaults, narrow network exposure, and test the deployment you operate before storing real user data.

## 🔑 Credentials and secrets

Never commit or share:

- private keys or seed phrases;
- passwords or password exports;
- `SECRET_KEY` values;
- Telegram or Discord bot tokens;
- webhook URLs;
- X API credentials;
- bearer tokens; or
- database files, screenshots, or logs containing sensitive data.

The checked-in workflow does not need a private key or seed phrase. The `wallet` profile field is text metadata only.

The backend reads environment variables in `backend/config.py`; a deployment should provide protected secret handling rather than committing real values. See [Configuration](configuration.md) and the root [.env.example](../.env.example).

## 🔐 Authentication and authorization

- Registration stores a bcrypt password hash, not the plaintext password.
- Login returns a JWT signed with `SECRET_KEY`.
- The frontend stores the JWT in browser `localStorage` under `token`.
- Protected routes resolve the current user from the bearer token.
- Profile and campaign lists are user-scoped.
- Campaign status changes check campaign ownership.
- `/step` checks profile and campaign ownership and verifies that the task belongs to the submitted campaign before accepting evidence.

### Deployment implications

1. Replace the development JWT key with a strong, unpredictable secret.
2. Use HTTPS whenever the browser and API are not strictly on one trusted machine.
3. Narrow `AIP_CORS_ORIGINS` to the exact frontend origins you control.
4. Consider an HttpOnly, Secure, SameSite cookie strategy before deploying to untrusted users; `localStorage` tokens are readable by successful same-origin XSS.
5. Review token lifetime and add a deliberate revocation/rotation strategy if the application becomes multi-user or public.

## 🗄️ Database and evidence

The default `backend/aws.db` contains usernames, profile metadata, campaign data, progress, and notification records. The `backend/screenshots` directory is intended to hold submitted evidence and may contain personal or account information.

- Keep both paths outside public static hosting.
- Apply filesystem permissions appropriate to the operator and service account.
- Back up and transfer them as sensitive application data.
- Review `CLEANUP_HOURS` before using the cleanup task as a retention policy.
- Cleanup removes eligible `DONE` progress rows and their corresponding in-root screenshot files; if a file cannot be removed, its progress row is retained for retry.
- Do not attach the database or raw screenshots to issues.

## Third-party notifications

Configured status messages can leave the host through Discord, Telegram, or X. Use destinations you control, grant the minimum platform permissions, and inspect message content before enabling an adapter.

The notifier is best-effort: adapter exceptions are swallowed and there is no retry queue or delivery receipt. The application records a user-scoped workflow event when a notification is triggered, but that row does not prove external delivery. A missing credential disables a channel; it is not a security fallback.

## 🛡️ Runtime security checks

Authenticated users can inspect `GET /security/status` (also available in the frontend Security Center). The response reports known configuration controls such as the JWT default, CORS scope, public-only wallet metadata, and evidence retention. It is an operational checklist, not a security score, penetration test, or guarantee of safety.

## Data minimization

Use placeholder values for local tests. Avoid entering real IP addresses, locations, social handles, wallet identifiers, or notes unless the deployment has a clear purpose, access policy, retention policy, and backup policy for them.

## Responsible reporting

If you find a security issue:

1. Do not publish exploit details immediately.
2. Do not include live credentials, private data, or a weaponized payload in an issue.
3. Provide a concise reproduction, impact, affected file/version, and a safe contact route to the maintainers.
4. If secrets were exposed, revoke or rotate them first and describe only the redacted class of secret.

---

[← Networks](networks.md) · [Troubleshooting →](troubleshooting.md)
