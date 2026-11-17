# Followly backend architecture

Phase 6 adds a NestJS API in `backend/`. The Expo app is unchanged as a product: it still does not show a login screen, and it still does not talk to Instagram. The mobile project only gained a typed API client and an auth store for a later screen.

## What is implemented

- Email and password registration, login, refresh, logout, and current user.
- Argon2id password hashes.
- Short-lived JWT access tokens.
- Refresh tokens stored as SHA-256 hashes, rotated on use, and revoked on logout.
- PostgreSQL through Prisma, with `User` and `RefreshToken` only.
- Redis connectivity and a BullMQ root connection for later jobs. No job processors are registered.
- Helmet, CORS, body size limits, DTO validation, auth rate limits, and a shared error envelope.
- Swagger at `/docs` outside production.
- `GET /api/v1/health` for the API, PostgreSQL, and Redis.

## What is not implemented

Follower retrieval, ZIP or JSON import, the comparison engine, AI, OpenAI, RevenueCat, subscriptions, and push notifications are not part of this service. Instagram account connection is implemented separately and documented in `docs/META_INSTAGRAM_SETUP.md`.

## Modules

```text
backend/src/
  config/        environment parsing and Joi validation
  common/        response envelope, exception filter, validation pipe, JWT guard
  database/      Prisma client lifecycle
  redis/         ioredis client used by the health check
  queue/         BullMQ connection only; no queues or processors
  auth/          register, login, refresh, logout, JWT strategy
  users/         account creation and the public profile
  health/        dependency status
```

`AppModule` loads configuration first. The process refuses to boot when a required variable is missing. In production it also refuses the local development database password and the placeholder JWT secret.

## Data model

`User` has a unique email, an Argon2id `passwordHash`, a display name, an optional avatar URL, an optional `emailVerifiedAt`, and `isActive`. Email verification is stored but no verification mail is sent.

`RefreshToken` belongs to a user and is deleted with that user. The table stores `tokenHash`, not the token itself. `expiresAt` and `revokedAt` decide whether it can be used. Instagram passwords and session cookies are not stored.

## Authentication flow

1. Registration validates the email, requires a 10–128 character password with upper, lower, and a digit, stores the normalized email, hashes the password with Argon2id, and returns the public user. It does not return a session.
2. Login checks the hash. Unknown emails still run a verification against a dummy hash. The error is always “Invalid email or password.”
3. A successful login signs a JWT (`sub`, `email`, configurable TTL) and stores only the hash of a random 32-byte refresh token.
4. `POST /auth/refresh` finds the hash, rejects an expired token, and in one transaction revokes the presented token and inserts the next hash. The previous raw token cannot be used again.
5. Presenting a token that is already revoked revokes the user’s other active refresh tokens. A stolen earlier token cannot keep a newer session alive.
6. Logout sets `revokedAt` on the presented token.
7. `GET /auth/me` and `GET /users/me` require `Authorization: Bearer`. The JWT strategy loads the user and rejects an inactive account.

Access tokens are not stored in PostgreSQL. Refresh tokens are never logged. Request bodies are not logged.

## API envelope

Success:

```json
{ "success": true, "data": {}, "message": "Operation completed" }
```

Failure:

```json
{ "success": false, "message": "A user-friendly error message", "code": "ERROR_CODE" }
```

Production responses do not include stack traces. Codes used now include `VALIDATION_ERROR`, `EMAIL_TAKEN`, `INVALID_CREDENTIALS`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_EXPIRED`, `REFRESH_TOKEN_REVOKED`, `UNAUTHORIZED`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`, and `INTERNAL_ERROR`.

The global prefix is `/api/v1`. Swagger is served at `/docs` when `NODE_ENV` is not `production`, with Bearer auth named `access-token`.

## Security controls

- Argon2id for passwords.
- SHA-256 and a timing-safe comparison for refresh-token hashes. The raw token is 256 bits, so a slow password hash is not required to store it.
- Global `ValidationPipe` with whitelist and forbidden extra fields.
- Helmet, a 32kb JSON limit, and CORS origins from `CORS_ORIGINS`. Requests with no `Origin` header are allowed so native apps can call the API.
- A global rate limit, with a tighter limit on `/auth` from `AUTH_THROTTLE_LIMIT`.
- Secrets live in `backend/.env`, which is gitignored. The mobile app only receives `EXPO_PUBLIC_API_URL`.

## Mobile client

`src/lib/api/client.ts` is the only place that reads the API base URL. It adds a timeout, the bearer header from Expo SecureStore, and one refresh retry after a 401. On web, tokens stay in memory because SecureStore is not available and AsyncStorage is not used for them. Passwords are not stored.

`src/stores/auth-store.ts` exposes register, login, logout, current-user loading, a loading flag, and an error message. No screen calls it yet.

## Later integration points

A future Instagram phase can add account and snapshot tables without changing the user primary key. Import and comparison work belongs in BullMQ processors registered from `queue/`. Those processors do not exist yet. AI and billing should be separate modules with their own credentials, not new fields on `User` until their phase is approved.
