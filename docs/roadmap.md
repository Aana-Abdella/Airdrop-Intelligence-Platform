# 🗺️ Roadmap

[Documentation](README.md) / Roadmap

This page records opportunities—not release commitments. An item is not shipped until code, tests, configuration, security guidance, and user documentation are merged.

## Near-term foundations

- [x] Align the `/step` request model, campaign/task ownership validation, and route tests.
- [ ] Add frontend controls for API task definitions and progress/evidence only after that contract is safe.
- [ ] Connect an intentional status-refresh UX or complete the per-user background refresh design.
- [ ] Move backend secrets out of Python constants into a documented environment/settings layer.
- [x] Add screenshot cleanup, size/type limits, and a documented retention policy.
- [ ] Narrow CORS and document supported deployment origins.

## Product quality

- [ ] Add a user-visible history/notification experience backed by real audit writes.
- [ ] Add profile and campaign edit/delete flows with ownership tests.
- [ ] Clarify product labels where panels currently use aspirational “AI,” wallet, discovery, or automation language.
- [ ] Add frontend component/interaction tests and accessibility checks.
- [ ] Add documentation screenshots from a sanitized demo environment.

## Operational scale

- [ ] Evaluate PostgreSQL and versioned migrations for multi-instance deployment.
- [ ] Introduce a durable worker/queue only for defined, observable jobs.
- [ ] Add notifier retries, per-user preferences, delivery state, and rate-limit handling.
- [ ] Add deployment packaging and protected secret injection after runtime requirements are defined.

## External data and networks

Potential source or chain integrations require separate design and security review. If pursued, begin with read-only provider interfaces, provenance, rate-limit handling, explicit supported-network documentation, and tests. Wallet signing or transaction execution is **not** implied by this roadmap.

## Contribution rule

Do not market roadmap items, static helper data, placeholder scrapers, or fixtures as current capabilities. Update [Changelog](changelog.md) only when behavior is actually merged.

---

[← Contributing](contributing.md) · [Changelog →](changelog.md)
