# Career Fingerprint — API

## What this is

The backend for Career Fingerprint. Handles all business logic, data access, auth sessions, Stripe webhooks, and email.

---

## Stack

- **NestJS** (TypeScript)
- **Prisma** — only ORM, no raw SQL
- **PostgreSQL**
- **Redis** (`@keyv/redis` via `CacheService`) — sessions, user cache, subscription cache
- **BullMQ** — background job queues (mail, registration, goals, stripe, account cleanup)
- **Sentry** — error tracking (`instrument.ts`)
- **Stripe** — subscription management only, no one-time payments
- **Amplitude** — server-side event tracking

---

## Structure

```
src/
├── achievement/          # STAR entries + plan limit guard
├── achievement-tags/     # Tags for achievements
├── account-clean-up/     # BullMQ processor for account deletion
├── admin/                # Platform admin endpoints
├── audit/                # Audit log service + events
├── auth/                 # Auth service, guards, JWT strategy, SAML
├── auth-better/          # Better Auth hooks (currently unused/experimental)
├── authcookie/           # Cookie helper service
├── bullet-points/        # Resume bullet points
├── cache/                # CacheService (Redis wrapper)
├── clients/              # Org client management
├── contacts/             # Contact records
├── cover-letters/        # AI-generated cover letters
├── decorators/           # @HasFeature, @MinPlanLevel
├── domain/               # Org SSO domain management
├── dto/                  # Shared DTOs (pagination, etc.)
├── education/            # User education records
├── events/               # Internal NestJS event definitions
├── feedback/             # User feedback
├── goal/                 # Career goals + BullMQ processor
├── health/               # Health check endpoint
├── highlights/           # Interview highlights
├── job-applications/     # Job application tracking
├── job-positions/        # Employment history
├── login-token/          # Magic link / login token flow
├── mail/                 # Email service + BullMQ processor
├── meetings/             # Interview/meeting management
├── my-fingerprint/       # User fingerprint profile data
├── notes/                # Meeting / general notes
├── onboarding/           # Onboarding flow
├── org/                  # Organization management
├── org-users/            # Org seat management
├── pdf/                  # PDF generation service (pdfmake, Roboto fonts)
├── permission/           # Permission service + guard + roles map
├── prep/                 # Interview prep questions + answers
├── prisma/               # PrismaService
├── register/             # Registration flow + BullMQ processor
├── reports/              # Org reporting
├── resume/               # Resume generation
├── sentry/               # Sentry exception filter
├── skill-list/           # User skill list
├── sse/                  # Server-sent events
├── stripe/               # Stripe service, webhook controller, BullMQ processor
├── subscriptions/        # Subscription model + service
├── tasks/                # Scheduled tasks (cron)
├── thank-yous/           # Thank you notes
├── types/                # Express type extensions
├── users/                # User profile + plan info
└── utils/                # Shared utilities
```

---

## Auth

Custom JWT + Redis session system (not Better Auth — ignore any Better Auth references):

- **Login** creates a Redis session (`session:{uuid}`) and sets two cookies: `accessToken` (JWT, 7d) and `sessionAccessToken` (UUID session ID, 7d)
- **Guard:** `SessionOrJwtGuard` in `auth/session-auth.guard.ts` — checks session cookie first, falls back to JWT passport strategy
- **Use `SessionOrJwtGuard`** on all protected routes (not `JwtAuthGuard` or Better Auth guards)
- Session TTL: 7 days (604800s)
- Session stored in Redis at key `session:{uuid}` → `{ userID, email, createdAt }`
- On session hit, `req.user` is populated with user + subscription + permissions

**Auth entry points (all create sessions):**
1. Regular login: `POST /auth/login`
2. Org login: `POST /auth/login/org/:id`
3. SSO: `POST /auth/sso/callback`
4. Magic link: `GET /login-token/verify/:token`

---

## Conventions

- **All DB access via Prisma.** No raw SQL.
- **Guards:**
  - `SessionOrJwtGuard` — standard auth guard for all protected routes
  - `OrgAdminGuard` — org-level admin check
  - `PlatformAdminGuard` — platform admin check
  - `FeatureGuard` + `@HasFeature(FeatureFlags.X)` — plan feature gating
  - `SubscriptionGuard` — active subscription check
- **Error handling:** public-safe errors are surfaced to the client. Security-sensitive errors (e.g., account enumeration) are silenced — return a generic response.
- **No PII in logs or analytics.** Sanitize/hash identifiers before passing to Amplitude.
- **Background jobs:** use BullMQ via the relevant processor (mail, register, goal, stripe, account-clean-up).

---

## Plans and limits

| Plan            | Description                                            |
| --------------- | ------------------------------------------------------ |
| `limited-trial` | Free tier, capped at 10 achievements, no card required |
| `pro`           | $7.99/month, no limits                                 |

Plan features are stored as an array on the `Plan` model and checked via `FeatureGuard`. Use `@HasFeature(FeatureFlags.X)` decorator + `FeatureGuard` for feature-level gating.

**Achievement limit response:** `403` with body `{ code: "ACHIEVEMENT_LIMIT_REACHED" }`

---

## Feature flags

All feature flags are defined in `src/utils/featureFlags.ts` as string constants. Categories include: achievements, achievement-tags, bullet-points, meetings, resumes, cover-letters, job applications, job positions, education, skills, goals, notes, highlights, thank-yous, weekly emails, org.

Use `@HasFeature(FeatureFlags.X)` on controller methods + register `FeatureGuard` in the module.

---

## Permissions (org roles)

Defined in `src/permission/permissions.ts`. Roles:
- `org_owner` — full control
- `org_admin` — manages settings, domains, seats, users, clients
- `billing_admin` — billing only
- `user_admin` — manages users and clients
- `advisor_admin` — view/edit/comment career data
- `viewer` — read-only
- `sso_admin` — SSO configuration

Use `@RequirePermission('permission:action')` decorator + `PermissionGuard`.

---

## Cache

Global `CacheService` at `src/cache/cache.service.ts`. Methods: `get`, `set`, `del`, `wrap`.

Common cache keys:
- `session:{uuid}` — session data (7d TTL)
- `currentUser:{userID}` — user object
- `activeUserSubscription:{userID}` — active subscription (24h TTL)

---

## Adding a new feature

1. Create `src/[feature]/[feature].module.ts`, `.controller.ts`, `.service.ts`
2. Register the module in `AppModule`
3. Add Prisma model if needed → `npx prisma migrate dev`
4. Guard all routes with `SessionOrJwtGuard`
5. Add `FeatureGuard` + `@HasFeature(...)` if plan-gated
6. Add permissions check via `PermissionGuard` if org-scoped

---

## Things to avoid

- Don't query the DB directly — use Prisma.
- Don't use `JwtAuthGuard` alone — use `SessionOrJwtGuard`.
- Don't reference Better Auth for session handling — the auth system is custom JWT + Redis.
- Don't expose internal error details to the client for security-sensitive operations.
- Don't log or track PII.
