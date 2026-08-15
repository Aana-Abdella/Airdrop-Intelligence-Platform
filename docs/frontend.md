# 🖥️ Frontend

[Documentation](README.md) / Frontend

The interface is a React 18 single-page application built with Vite, React Router, Axios, and Tailwind CSS.

## Routes and screens

| Route | Component | Behavior |
|---|---|---|
| `/login` | `Login.jsx` | Sign-in and registration forms |
| `/` | `Dashboard.jsx` | User-scoped metrics, derived panels, and campaign pipeline |
| `/profiles` | `ProfileManager.jsx` | Create and list farming-profile metadata |
| `/airdrops` | `AirdropTracker.jsx` | Create campaigns and manually edit status |
| `/tasks` | `Operations.jsx` | User-scoped task status and latest evidence activity |
| `/notifications` | `Operations.jsx` | Notification workflow events; not third-party delivery receipts |
| `/security` | `Operations.jsx` | Runtime configuration checks; not a security guarantee |

`ProtectedRoute` in `App.jsx` redirects unauthenticated visitors to `/login`. Authenticated users visiting `/login` return to `/`.

## Application structure

```text
frontend/src/
├── main.jsx                       # React entrypoint
├── App.jsx                        # session restoration and routes
├── api.js                         # shared Axios client
├── index.css                      # Tailwind layers and project styles
└── components/
    ├── Login.jsx                  # register/sign-in state
    ├── Dashboard.jsx              # overview workspace
    ├── ProfileManager.jsx         # profile create/list/delete
    ├── AirdropTracker.jsx         # campaign create/tasks/status board
    ├── Operations.jsx             # tasks, notifications, security views
    └── ui.jsx                     # AppShell, Icon, Modal, EmptyState
```

## Authentication client

`frontend/src/api.js`:

- uses `VITE_API_URL` or `http://localhost:8000`;
- reads `token` from `localStorage`;
- injects `Authorization: Bearer <token>`;
- clears the token on an API `401`; and
- dispatches the `auth:expired` browser event.

`App.jsx` listens for that event and calls `GET /auth/me` during session restoration. Browser route guards are only UX controls; the backend owns authorization.

## Dashboard data

`Dashboard.jsx` requests `GET /airdrops` and `GET /dashboard` in parallel. It renders loading, API-error, and empty states. Several section labels are aspirational product language:

- **AI recommendations** are deterministic backend scores;
- **Wallet overview** is profile-derived metadata with unconnected values;
- **Discovery feed** contains the user's tracked campaigns; and
- **Automation queue** is empty in the current primary response.

Document these distinctions whenever changing product copy.

## Forms and validation

- Registration requires a valid username and a minimum password length of eight, matching the API contract.
- Profile creation requires email, public wallet metadata, and Chrome port in the UI; private-key-shaped and seed-phrase-shaped values are rejected by the API.
- Campaign creation requires name, HTTP(S) website, reward type, and deadline, and can include task items.
- The UI supports status updates, task activity, notification history, profile deletion when no evidence depends on it, and runtime security checks. Evidence submission remains an API workflow and wallet signing/transaction history are not shipped.

## Local development

```bash
cd frontend
npm install
npm run dev
```

Production build check:

```bash
npm run build
```

Optional production-build preview:

```bash
npm run preview
```

## Contribution conventions

1. Keep HTTP calls in the shared API module or an intentional service layer.
2. Preserve auth-expiry handling and protected-route behavior.
3. Reuse `AppShell`, `Modal`, `Icon`, and `EmptyState` where appropriate.
4. Include loading, empty, validation, and API-error states.
5. Use semantic buttons/links and preserve labels/ARIA behavior.
6. Do not label fixtures or local scoring as live intelligence.
7. Run `npm run build` before opening a pull request.

---

[← Bot Guide](bot.md) · [Backend →](backend.md)
