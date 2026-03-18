# Career Fingerprint – API

The NestJS backend for Career Fingerprint. Handles authentication, career data, resume generation, job application tracking, interview prep, organization management, and payments.

**Version:** 2.0.0

## Tech Stack

- [NestJS 11](https://nestjs.com/)
- [Prisma](https://www.prisma.io/) ORM
- [Redis](https://redis.io/) via `@keyv/redis` and `cache-manager` for session storage and caching
- [Bull](https://docs.bullmq.io/) for async job queues
- [Better Auth](https://www.better-auth.com/) with SAML SSO support
- [Stripe](https://stripe.com/) for subscriptions and payments
- [Sentry](https://sentry.io/) for error tracking
- [Swagger](https://swagger.io/) for API documentation
- TypeScript (ES2023)

## Getting Started

Install dependencies:

```bash
yarn install
```

Start the development server:

```bash
yarn start:dev
```

Other commands:

```bash
yarn build          # Production build (includes Sentry sourcemap upload)
yarn start:prod     # Start the compiled production build
yarn start:debug    # Development with debugger attached
yarn test           # Unit tests
yarn test:watch     # Unit tests in watch mode
yarn test:cov       # Test coverage report
yarn test:e2e       # End-to-end tests
```

Database seeding:

```bash
yarn seed:plans     # Seed subscription plans
yarn seed:skills    # Seed the skills list
```

## API Documentation

Swagger is available at `/api` when the server is running.

## Project Structure

```
src/
  auth/             # JWT sessions, guards, and strategies
  auth-better/      # Better Auth hooks and extended flows
  authcookie/       # Cookie-based auth handling
  prisma/           # Prisma service
  cache/            # Redis caching service
  health/           # Health check endpoint

  users/            # User profiles and management
  register/         # Registration flows
  login-token/      # Magic link login
  account-clean-up/ # Account deletion

  resume/           # Resume management
  job-positions/    # Job position tracking
  job-applications/ # Job application management
  achievement/      # Achievement tracking
  achievement-tags/ # Achievement categorization
  bullet-points/    # Resume bullet point generation
  education/        # Education history
  notes/            # User notes
  highlights/       # Content highlights
  cover-letters/    # Cover letter generation
  thank-yous/       # Thank you note management

  meetings/         # Meeting and interview scheduling
  prep/             # Interview prep materials
  feedback/         # User feedback
  goal/             # Goal tracking
  my-fingerprint/   # Personal career fingerprint data

  org/              # Organization management
  org-users/        # Org user management
  admin/            # Admin dashboard operations
  clients/          # Client management
  contacts/         # Contact management
  permission/       # Role-based permissions
  audit/            # Audit logging

  subscriptions/    # Subscription management
  stripe/           # Stripe webhook and billing

  pdf/              # PDF export generation (pdfmake)
  reports/          # Report generation
  mail/             # Email service (MJML/Pug templates)
  sse/              # Server-Sent Events for real-time updates
  onboarding/       # Onboarding workflows
  domain/           # Domain verification for orgs
  skill-list/       # Skills list management
  tasks/            # Background task management

  decorators/       # Custom NestJS decorators
  dto/              # Data Transfer Objects
  types/            # Shared TypeScript types
  utils/            # Utility functions
  sentry/           # Sentry integration
```

## Authentication

Authentication supports multiple methods:

- **JWT** – Access tokens in `accessToken` cookie (7-day expiry)
- **Session** – UUID session IDs stored in Redis, set in `sessionAccessToken` cookie (7-day expiry)
- **Magic links** – Passwordless login via `/login-token/verify/:token`
- **SAML SSO** – Enterprise SSO via passport-saml
- **Better Auth** – Extended auth flows via `@thallesp/nestjs-better-auth`

The `SessionOrJwtGuard` checks for a valid Redis session first, then falls back to JWT validation.

## Key Configuration

The API reads configuration from environment variables:

- `FRONT_END_URL` – Sets the CORS allowed origin
- `DATABASE_URL` – Prisma database connection string
- `REDIS_URL` – Redis connection string for sessions and caching
- `JWT_SECRET` – Secret for signing JWT tokens
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` – Stripe integration
- `SENTRY_DSN` – Sentry error tracking

Stripe webhook events are handled at `/webhook` with raw body parsing to verify signatures.

## Architecture Notes

- Global `ValidationPipe` with transform enabled for all request bodies
- Rate limiting via `@nestjs/throttler`
- Cookie parser middleware enabled globally
- Passport initialized for JWT and session strategies
- Sentry initialized at startup for error and performance monitoring
- Better Auth requires the global body parser to be disabled; raw body parsing is configured manually for Stripe webhooks
