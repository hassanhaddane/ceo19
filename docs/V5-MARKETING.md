# V5 Shop email / SMS waitlist

## Current activation status

The deployment target is now **Vercel / serverless**. The production adapter is **Neon Postgres over HTTPS**, without Supabase. Its standalone migration, restricted application login, parameterized driver, atomic database writes, consent audit, suppression and shared rate limits are implemented and tested. The Neon integration has been suggested but is not yet confirmed connected; no hosted Neon database or credential exists in this checkout. No remote collection or deployment is claimed active. No Supabase project was created or modified.

A persistent random token-signing secret is stored privately in ignored .env.local (mode 0600), without displaying it. Local development still uses private SQLite in `.private/marketing/waitlist.sqlite` (directory 0700/file 0600) until real Neon setup commits and passes health checks. That local development setting must never be copied to Vercel. The existing guard rejects SQLite on serverless hosts. There is no automatic fallback from missing/broken Neon credentials to local files. Email/SMS delivery credentials remain absent; accepted local test requests remain unverified, with truthful UI feedback.

Verification uses PGlite, an isolated real PostgreSQL engine, as a dev-only test dependency. SQL transactions, RLS/role permissions, deduplication and persistence after close/reopen are exercised with the actual migration. A separate localhost test transport allows browser-to-endpoint-to-Postgres tests using reserved synthetic email addresses and no delivery provider. It is not a production fallback or a mock success response. Test data is removed afterwards.

SQLite additionally has real on-disk integration tests for atomic rollback, separate processes contending on the same file, repeated opens, consent evidence, deduplication, confirmation, opt-out/re-opt-in, persistent quotas, retention, path/permission rejection and private administration/backup. Browser validation uses the actual Next.js endpoint and SQLite storage; synthetic records are removed afterwards.

## Vercel / Neon setup

1. Add/connect Neon in Codex, or create Neon through the Vercel Marketplace for the actual website project. Select and approve any provider plan/cost in that account. No paid resource is silently provisioned. Keep the database near the function region. The integration's automatically supplied owner `DATABASE_URL` is an **administrative** credential, not the runtime login expected here.
2. In a private local terminal/environment, provide the actual Neon admin connection as `MARKETING_DATABASE_ADMIN_URL` (TLS required). Do not paste it into chat or commit it. Keep the existing persistent signing secret in private `.env.local` (0600). Use a new dedicated database; the setup refuses existing marketing tables/roles and never truncates data.
3. Run `node --env-file=.env.local scripts/marketing-neon-setup.mjs`. It refuses to switch if the active local SQLite database contains contacts: genuine requests require a verified migration preserving all channel/audit/suppression history first, not deletion to bypass the check. The fresh-database setup executes `database/marketing/001_neon_waitlist.sql` and generates the application password in a **single atomic SQL statement**. Only after the database acknowledges commit does it atomically update private `.env.local` to `MARKETING_STORAGE=neon` and the restricted `MARKETING_DATABASE_URL`. It prints no connection string/password/contact. A failure before submission leaves active storage unchanged. If the request outcome is uncertain, a private `.env.neon-*.local` candidate is retained because SQL may have committed; inspect database state and verify the candidate before retrying. Do not blindly rerun or rotate signing keys. Restart the preview after confirmed activation.
4. In Vercel project environment settings, privately configure `MARKETING_STORAGE=neon`, `MARKETING_DATABASE_URL` (restricted application URL), the persistent `MARKETING_TOKEN_SECRET`, and `MARKETING_PUBLIC_URL=https://ceo19.ma` (or the actual approved deployment origin). Never deploy the admin URL, any NEXT_PUBLIC_ database credential, or SQLite path settings. Use a separate Neon database/branch and signing secret for preview/testing; don't point preview submissions at the production audience. Redeploy after configuration.
5. Verify availability and a synthetic email/SMS opt-in, confirmation, withdrawal and public-access denial on the actual deployed environment. Clean synthetic rows afterwards. The application returns unavailable/503 rather than saved when the selected database/configuration is missing, unreachable, unmigrated or using an owner role. Build/import works even before credentials are supplied.

The single dependency `@neondatabase/serverless` is used server-side over HTTPS, with parameterized values, no-store requests and bounded timeouts. Each subscription invokes one stored Postgres function; both contact channels, consent events and rate windows execute inside the same database transaction. Independent Vercel instances share database state; there are no per-instance contact stores or in-memory rate quotas. There is no connection pool, WebSocket session or background task to keep alive. Neither Home's client bundle nor the waitlist client includes this driver or credentials.

The standalone migration is generated from the original consent/transaction SQL by `scripts/generate-marketing-neon-migration.mjs`; tests assert they remain aligned. It has no Supabase role/API dependency. It creates `ceo19_marketing_runtime` (NOLOGIN group) and `ceo19_waitlist_app` (restricted LOGIN, password set only by private setup). Tables have RLS; only that group has explicit policies/grants. Public table/view/function access and public schema CREATE are revoked. Functions remain SECURITY INVOKER with qualified references/empty search paths. The application role cannot create databases/roles/tables, bypass RLS, or alter/delete audit events. Every runtime query also checks role suitability; owner/admin connections are rejected even on a direct subscription POST. Neon roles created through provider UI/API commonly carry administrative privileges, so the application role is deliberately created by SQL instead.

Administrative contacts remain accessible only in the authenticated Neon SQL/table interface using trusted admin credentials. Never add a public export route or use unverified requests as a campaign list. Use the confirmed channel audience views for eventual campaigns, keep suppression evidence, verify ownership before deletion, and configure provider backups/restoration according to the selected Neon plan. `scripts/marketing-maintenance.mjs` supports Neon and prints counts only; schedule it daily through trusted CI/backend infrastructure. No scheduler, actual backups or campaign sender is claimed active.

## No-account SQLite operation

Requires Node 24 on **one persistent host**, a private local disk and backups. The native `node:sqlite` module adds no dependency. Schema migration 1 is versioned in `src/lib/marketing/sqlite-schema.ts`, applied under a transaction and tracked with `PRAGMA user_version`; incompatible newer schemas fail closed. Tables/columns and audience eligibility match the Postgres model; SQLite booleans are 0/1 and timestamps are UTC Unix milliseconds. SQLite has no database roles/RLS: access is restricted by the host OS, the server-only runtime and absence of public database/list/export endpoints.

`MARKETING_STORAGE=sqlite` and an absolute `MARKETING_SQLITE_PATH` are mandatory. Production additionally requires `MARKETING_SQLITE_PERSISTENT=1`, acknowledging a verified persistent disk. Known serverless environments (Vercel, Netlify, Lambda, Functions) are rejected, as are public/build/dependency paths and production temporary directories. This is not a deployable local-file database for Vercel. Do not use multiple machines or a network-mounted database file; keep one durable host or explicitly configure a remote adapter instead. There is no automatic storage switch that could fragment or lose contacts.

Writes use prepared statements, `BEGIN IMMEDIATE`, WAL, `synchronous=FULL`, foreign keys, secure deletion and a bounded lock timeout. Each operation commits before acknowledgement and closes its connection. Runtime checks enforce private directory/file ownership and permissions and reject links. The token-signing secret stays server-side and must survive deploys independently of the database.

Private host administration (run from the project directory with authorized filesystem access):

```sh
node --env-file=.env.local scripts/marketing-admin.mjs status
node --env-file=.env.local scripts/marketing-admin.mjs export /absolute/private/directory/contacts.json
node --env-file=.env.local scripts/marketing-admin.mjs backup /absolute/private/directory/waitlist-backup.sqlite
node --env-file=.env.local scripts/marketing-admin.mjs suppress <contact-UUID> email
node --env-file=.env.local scripts/marketing-admin.mjs delete <verified-contact-UUID>
node --env-file=.env.local scripts/marketing-maintenance.mjs
```

Export/backup destinations must be in an existing private directory, never public assets. Existing files are not overwritten. The CLI prints counts/outcomes only, never contacts or secrets; exports exclude confirmation hashes and explicitly label pending requests as unsuitable for campaigns. Backups use SQLite's consistent backup API rather than copying a live WAL file. Keep encrypted backups under restricted host access, test restoration, schedule backups and daily retention maintenance through the trusted host scheduler. The scripts exist; no production scheduler is claimed configured. Do not send campaigns from an administrative export: use only the confirmed, unsuppressed channel audience views. Verify contact ownership before deleting or disclosing data; remove downstream copies and handle retained backups under the operator's deletion policy.

## UI and routing

- Only `/en/shop` and `/fr/shop` mount the waitlist. Explicit SHOP navigation opens it as soon as the route is ready; direct entry prompts once unless dismissed in this tab session. There are no passive timers. A sessionStorage dismissal boolean prevents repeats, while SHOP and GET EARLY ACCESS allow explicit reopening. No personal data, consent or draft is stored in browser storage.
- BE FIRST., localized subtitle, email and international phone fields, independent email/SMS checkboxes, JOIN THE DROP LIST and Close use the existing CEO blue/cream/black system.
- Both consents start unchecked. An email address is optional for SMS-only requests. A phone is required only when SMS consent is chosen. Entering a phone is not consent. Unselected channel fields are excluded from the request and ignored again on the server.
- All phone-library countries are available, plus direct international `+` input. Country selection is explicit; IP/locale is not used to infer it. Server validation uses the full libphonenumber-js metadata; only the lighter country UI is lazy-loaded after opening.
- The native dialog reuses existing focus/scroll handling. The shared hook now includes inputs/selects/checkboxes in its focus traversal. Close stays sticky; visualViewport sizing accommodates small/keyboard-sized viewports. Fields freeze while saving; Close remains available. Closing unmounts and clears the draft.
- `/[locale]/shop/privacy` describes the purpose, data, verification, optional processors, unsubscribe and deletion contact. It never invents a company. `MARKETING_OPERATOR_NAME` is displayed only if explicitly configured. The verified artist contact remains CEO1.9CONTACT@GMAIL.COM.
- `/[locale]/shop/confirm` and `/[locale]/shop/unsubscribe` are noindex/no-referrer capability-link pages. GET never changes consent, protecting against email-link scanners. An explicit button makes the POST. The token is removed from the address bar after a successful operation. Language switching preserves the query token.

## Storage and consent evidence

Production Neon migration: `database/marketing/001_neon_waitlist.sql` (fresh dedicated database, applied by private setup only). Local SQLite migration: `src/lib/marketing/sqlite-schema.ts` (version 1). Original optional Supabase migration: `supabase/migrations/20261023004943_shop_marketing_waitlist.sql`.

Tables:
- `marketing_contacts`: UUID, channel, normalized email **or** E.164 phone; separate consent flags/times, exact version, source, locale, created/updated times, pending/confirmed/suppressed status, verification time, channel-specific withdrawal time, hashed confirmation token/expiry and confirmation delivery state.
- `marketing_consent_versions`: immutable application consent version/locale/channel wording. The initial exact strings match `src/data/marketing.ts`.
- `marketing_consent_events`: channel-specific requested opt-in, email confirmation, withdrawal and expired-pending events; database timestamp, exact wording/version, locale and source. The server role can append/read, not update/delete events directly. Contact deletion cascades its events for authorized deletion workflows.
- `marketing_rate_limits`: keyed hashes and window counts only; no raw IP, raw contact, user-agent or browser fingerprint.

One row per consented **channel** is deliberate: unverified email and phone entries must not merge or overwrite unrelated people's identities. Unique normalized addresses prevent uncontrolled duplicates. Both selected channels commit atomically; failure on either rolls back all contact/audit writes. No unconsented contact field is stored.

In the optional Supabase migration, all tables have RLS enabled. Public, anon and authenticated access is revoked; there are no public read/write policies. Explicit service_role grants support the server, including newer Supabase Data API grant requirements. RPCs are SECURITY INVOKER, use an empty search path and fully qualified table references; EXECUTE is revoked from PUBLIC/anon/authenticated. Postgres audience views use `security_invoker=true` and service-only grants. SQLite uses private filesystem/server access instead of RLS. Neither adapter exposes a public subscriber list/export.

`marketing_email_audience` and `marketing_sms_audience` are the only intended campaign sources: consent alone is insufficient. A channel must be confirmed, and its confirmation must be newer than any withdrawal. Never use the raw contact table as a campaign audience.

## Confirmation, duplicates and suppression

A successful storage response means **request stored**, not verified subscription. No frontend result appears unless the backend returns a valid `stored:true` acknowledgement after the SQL transaction commits.

Email confirmation is prepared and implemented via an optional Brevo transactional adapter. The server records a SHA-256 hash of a random 256-bit token, expiring after 48 hours. The raw token goes only into the requested confirmation message, not the database/logs/public subscription response. The API says confirmation was sent only after Brevo returns a successful acknowledgement with messageId. Provider absence/failure keeps the real stored request pending, records the delivery state and displays that confirmation is unavailable. No address is silently discarded; it is not activated for campaigns either. A fan can explicitly retry after delivery is configured; no background delivery worker is currently installed.

Duplicate requests reuse the unique contact but append genuine new consent evidence. A previously suppressed contact remains excluded from audiences until fresh explicit consent **and a new confirmation**. Old tokens are invalidated on withdrawal/new request/confirmation; an old confirmation cannot undo suppression. Existing confirmed contacts are not downgraded by a duplicate request.

`MarketingProvider` and `MarketingSubscriberService` separate storage, validation and delivery. Brevo is the single implemented optional confirmation provider. No marketing campaign sender or CRM export integration is installed. SMS requests remain pending and excluded from SMS audiences: no SMS delivery/OTP provider is configured or falsely claimed verified. Before any SMS campaign, implement authenticated provider verification and STOP/equivalent suppression events, applying them to the same channel records. Do not enable sending first.

Unsubscribe uses a constant-time-verified, signed UUID+channel capability token with no email/phone in its URL. It affects only that channel and is idempotent. The API also supports RFC 8058 `List-Unsubscribe=One-Click` POST with the signed query token, without a browser Origin requirement. Human links use the confirmation page; ordinary GET does not mutate. Persist `MARKETING_TOKEN_SECRET` across deploys so existing links remain valid. Plan retained-key verification before rotating it.

## Endpoints and protection

- `GET /api/marketing/status`: uncached availability only, no contact details.
- `POST /api/marketing/subscribe`: strict same-origin JSON, max 4096 bytes, server validation, honeypot, exact consent version, fixed source `shop_waitlist`, locale validation and explicit literal boolean consent.
- `POST /api/marketing/confirm`: one-time email ownership confirmation.
- `POST /api/marketing/unsubscribe`: signed channel-specific suppression, or signed RFC 8058 provider POST.

Server input validation normalizes email casing without Gmail-specific dot/plus rewriting and validates international numbers with libphonenumber-js/max. All channels are validated before storage. The API returns no contact IDs, addresses, existence indicators, provider secrets or raw database errors. Network/DB failures never fabricate an acknowledgement. If a response is lost after a commit, UI says it could not **confirm** saving and allows an idempotent retry.

Atomic database limits: 8 requests per client/15 minutes and 3 per normalized channel address/hour. Without an explicitly trusted edge IP header, the application uses a conservative shared 30/15-minute client bucket. Configure an IP header only if the host overwrites it; do not blindly trust client X-Forwarded-For. Hashing uses a server secret. Cross-site submissions, stale consent versions, honeypot entries and oversized payloads are rejected. No intrusive CAPTCHA is added.

No form data goes to analytics, and application code never logs addresses, phones, tokens, provider errors or secrets. Keep hosting/request logging from recording POST bodies or capability query tokens.

## Environment and activation

Required server variables:
- Vercel / serverless: `MARKETING_STORAGE=neon`, `MARKETING_DATABASE_URL` using `ceo19_waitlist_app`. `DATABASE_URL` is accepted only when it already uses that restricted login. `MARKETING_DATABASE_ADMIN_URL` is for private local setup only and must not be deployed.
- Local development / persistent host only: `MARKETING_STORAGE=sqlite`, absolute private `MARKETING_SQLITE_PATH`, and `MARKETING_SQLITE_PERSISTENT=1` for a deliberately persistent production host. This is not the selected Vercel deployment strategy.
- Optional Supabase instead: `MARKETING_STORAGE=supabase`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`). Never a NEXT_PUBLIC_ variable or browser publishable key.
- `MARKETING_TOKEN_SECRET`: persistent cryptographically random value, at least 32 characters; keep it private and backed up.
- `MARKETING_PUBLIC_URL`: real public HTTPS origin for confirmation links; loopback HTTP is allowed for local testing. SITE_URL is a fallback, but explicitly configure the right origin when enabling delivery.

Optional delivery:
- `MARKETING_EMAIL_PROVIDER=brevo`
- `BREVO_API_KEY`
- `MARKETING_FROM_EMAIL`: a real verified sender in that Brevo account.
- `MARKETING_FROM_NAME` (default CEO1.9).

Operator/deployment:
- `MARKETING_OPERATOR_NAME`: only verified operator details.
- `MARKETING_TRUSTED_IP_HEADER`: only a hosting-overwritten supported header (`x-real-ip`, `x-forwarded-for`, `cf-connecting-ip`).

Activation sequence:
1. Use the Vercel/Neon steps above for the selected serverless target. SQLite is local development only in this deployment strategy. No Supabase provisioning is pending or required.
2. Keep environment settings and the signing secret private and persistent. Do not paste secrets into chat or commit them. Restart after configuration changes. Availability becomes true only after the selected database actually opens with its expected schema; database errors never trigger an empty fallback.
3. Configure Brevo's verified sender/API key to enable confirmation delivery. Confirm a real test inbox before treating delivery as operational. Without it, collected email requests remain pending.
4. Schedule the private `public.marketing_maintenance()` RPC daily using trusted backend infrastructure. `scripts/marketing-maintenance.mjs` calls it with server environment credentials and prints only counts. It purges unverified/no-suppression records idle over 30 days, expires old re-opt-in requests back to suppressed while retaining withdrawal history, clears expired tokens and removes old rate buckets. No public maintenance endpoint or scheduler is silently created.
5. Restrict Neon dashboard/CRM access to authorized staff. Use authenticated database or private export tools, never an unauthenticated website export. Verify ownership for access/deletion requests via the published contact email; delete/suppress downstream copies when providers are added. Maintain minimal suppression evidence to honor opt-out choices.

## Verification and limits

Unit/integration tests cover email-only, SMS-only, both, no consent, literal boolean validation, invalid email/phone, safe normalization, duplicates/concurrency, channel unsubscribe, fresh re-opt-in verification, token tampering/replay/expiry, one-click POST, atomic database rollback, durable rate limits, missing storage/provider configuration, provider rejection/acknowledgement, cross-origin/honeypot/body bounds, public RLS/ACL denial, disk persistence and maintenance/suppression preservation.

The SQLite adapter collects durably on the local development host. Neon integration/schema/role behavior is tested with real isolated PostgreSQL, including the actual Neon HTTP driver's request and decoding path through a test transport. Actual managed Neon connectivity, provisioning, Vercel deployment, configured provider backups, Brevo inbox delivery and SMS delivery still require external setup. A local database test is not evidence of managed Neon connectivity. Missing/malformed storage configuration makes the form unavailable. No hosted project, live delivery or deployed collection is claimed active.

Primary references checked 23 October 2026:
- https://vercel.com/marketplace/neon
- https://neon.com/docs/serverless/serverless-driver
- https://neon.com/docs/manage/roles
- https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- https://developers.brevo.com/reference/send-transac-email
- https://github.com/catamphetamine/libphonenumber-js

### V5.1 Shop navigation entry

The Shop landing now consumes explicit SHOP navigation intent and opens the optional early-access dialog after the route mounts. Direct arrival prompts once unless dismissed in this tab session. Session storage contains only a dismissal boolean; no contact details or consent. Explicit SHOP clicks and the visible manual CTA may reopen it. The old 14-day localStorage cooldown is superseded by this user-requested visit policy. See V5-SHOP.md. Server storage, consent versions, validation and submission result requirements remain unchanged; opening the dialog never subscribes anyone.
