# Followly

Followly is a premium iOS and Android app for understanding Instagram audience movement and content performance. The mobile app includes onboarding, a five-tab dashboard, and the followers and analytics interfaces. Those screens do not invent Instagram statistics.

The API in `backend/` signs people in, stores sessions, and connects an eligible Instagram professional account. New Meta apps use Instagram API with Unified Login. Older apps can still use Instagram Login when no configuration id is set. The Expo app uses that API. Password recovery is not available because the API has no reset endpoint. A real Instagram connection still needs the Meta app credentials in [docs/META_INSTAGRAM_SETUP.md](docs/META_INSTAGRAM_SETUP.md).

## Mobile app

Requirements: Node.js 20 or newer, npm, and Expo Go or a simulator.

```bash
npm install
cp .env.example .env
npm start
```

`EXPO_PUBLIC_API_URL` is the only mobile environment variable. A simulator on this computer can use:

```text
http://localhost:3000/api/v1
```

A physical phone cannot use `localhost`, because that name points at the phone. Put the computer's LAN address in `.env` and restart Expo:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.234:3000/api/v1
```

The Android emulator reaches the host at `http://10.0.2.2:3000/api/v1`. Do not put database passwords, Redis URLs, or JWT secrets in any `EXPO_PUBLIC_` variable. Tokens on a device are kept in Expo SecureStore. The web preview keeps them in memory only.

```bash
npm run typecheck
npm run lint
```

After onboarding, the app opens Login. Create Account registers with `POST /api/v1/auth/register`, then signs in, because registration returns the public user and does not return tokens. Sign Out calls logout and always clears the device session, including when the network fails. Forgot password explains that recovery is not available and does not submit a request. Tokens on a device stay in SecureStore. The web preview keeps them in memory, so a browser refresh starts signed out.

## Backend

Requirements: Node.js 20 or newer, npm, and Docker.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Replace `JWT_ACCESS_SECRET` in `backend/.env` with a unique value of at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

`followly_dev_only` in the examples is a local database password. Change it before using a shared or public machine, and keep `DATABASE_URL` in `backend/.env` matched to the Compose password.

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Install the API, generate the Prisma client, apply migrations, and start NestJS:

```bash
npm --prefix backend install
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run start:dev
```

- API base: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/docs`

Swagger is disabled when `NODE_ENV=production`.

### API endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | Create an account. Returns the public user. |
| POST | `/api/v1/auth/login` | No | Return an access token, a refresh token, and the public user. |
| POST | `/api/v1/auth/refresh` | Refresh token in the body | Rotate the refresh token and return a new pair. |
| POST | `/api/v1/auth/logout` | Refresh token in the body | Revoke that refresh token. |
| GET | `/api/v1/auth/me` | Bearer access token | Current user. |
| GET | `/api/v1/users/me` | Bearer access token | Same current user. |
| GET | `/api/v1/health` | No | API, PostgreSQL, and Redis status. |
| GET | `/api/v1/instagram/connect` | Bearer access token | Instagram connection URL for the signed-in user. |
| GET | `/api/v1/instagram/callback` | OAuth `state` | Exchange Instagram's code and redirect back to the app. |
| GET | `/api/v1/instagram/accounts` | Bearer access token | Instagram accounts saved for the signed-in user. |
| GET | `/api/v1/instagram/accounts/:id` | Bearer access token | One owned Instagram account, without its token. |
| POST | `/api/v1/instagram/accounts/:id/sync-profile` | Bearer access token | Refresh the professional profile from Instagram. |
| POST | `/api/v1/instagram/accounts/:id/disconnect` | Bearer access token | Delete the saved Instagram token. Followly stays signed in. |

Successful responses use `{ "success": true, "data": {}, "message": "..." }`. Failures use `{ "success": false, "message": "...", "code": "ERROR_CODE" }`.

### Checks

The automated tests use the separate `followly_test` database and Redis database 1. They refuse to run if the URL does not point at `followly_test`.

```bash
npm --prefix backend run typecheck
npm --prefix backend test
npm run typecheck
```

Architecture details are in [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md). The phase plan is in [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md).

## Not built yet

A professional Instagram account can be connected and its profile stored. Insights sync, export import, follower comparison, AI, subscriptions, and push notifications are not implemented. Meta app credentials are still required before a real Instagram sign-in works.
