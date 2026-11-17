# Instagram connection setup

New Meta apps cannot use **API setup with Instagram login**. They use **Instagram API with Unified Login**, which is Facebook Login for Business. Followly follows that path when `META_INSTAGRAM_CONFIG_ID` is set.

The older Instagram Login path remains available when the configuration id is empty. It still uses `https://www.instagram.com/oauth/authorize`, `instagram_business_basic`, and `graph.instagram.com`. A new app does not offer that setup, so this guide is for Unified Login.

A real Instagram sign-in has **not** been completed in this project. App Review and Advanced Access have **not** been requested.

Official references:

- [Get started with the Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started)
- [Authentication and access tokens](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication)
- [Permissions](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/permissions)
- [IG User](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/)

## What you do in Meta

1. Open the Followly app in the [Meta App Dashboard](https://developers.facebook.com/). The app needs the **Manage messaging & content on Instagram** use case and must belong to a business portfolio. The Unified Login tab appears for that setup.
2. Open **Use cases → Manage messaging & content on Instagram → Customize → API setup with Unified login**.
3. Select **Create new configuration**. In **Edit permissions**, keep `instagram_basic`. Remove `ads_management`, `ads_read`, `instagram_manage_comments`, and `instagram_content_publish` if the editor allows it. Meta's default configuration also includes `instagram_manage_messages` and marks it required. Followly does not send or read messages. It stores the granted permission names and does not call messaging, comments, publishing, or ads endpoints.
4. The Instagram account asset is required. The ad account can be skipped.
5. The configuration preview shows the token type. A system-user access token does not expire when the preview says **Never**. Meta's troubleshooting notes say a Business System User access token is not supported on mobile devices. The iOS Simulator opens an auth browser session, which is not the same as a mobile SDK login, but Meta can still reject that token. If the dialog rejects it, create a user access token configuration that Meta labels as Instagram Login compatible, and use that configuration id instead.
6. Under **Redirect URL**, save an **HTTPS** URL whose path is exactly `/api/v1/instagram/callback`. `http://localhost` is rejected for this login. For a local API, use a tunnel that forwards to this machine's port 3000 and keep that path. Put the same URL in `META_INSTAGRAM_REDIRECT_URI`.
7. Copy the configuration id. It is not a secret. Copy the **Meta app ID** and **Meta app secret** from **App settings → Basic**. These are not a separate Instagram app id and secret.
8. In **Generate access tokens**, add the professional Instagram account as an Instagram Tester. Accept the invite on the web: Instagram **Settings → Website permissions → Apps and websites → Tester Invites**. Development mode only works for accounts with a role on the app. Test users are not supported. A personal Instagram account cannot connect.
9. Do not request App Review yet. Standard Access is enough for the tester account. Other people's accounts need Advanced Access and Live mode later.

Followly does not ask for an Instagram or Facebook password. The app secret stays in `backend/.env`. It must not be copied into `EXPO_PUBLIC_` variables, the Expo app, or git.

## Environment

```text
META_INSTAGRAM_APP_ID=
META_INSTAGRAM_APP_SECRET=
META_INSTAGRAM_CONFIG_ID=
META_INSTAGRAM_REDIRECT_URI=https://your-tunnel.example/api/v1/instagram/callback
META_INSTAGRAM_API_VERSION=v27.0
META_INSTAGRAM_SCOPES=instagram_business_basic
META_TOKEN_ENCRYPTION_KEY=
META_TOKEN_ENCRYPTION_KEY_PREVIOUS=
```

`META_INSTAGRAM_SCOPES` is used only by the older Instagram Login path. Unified Login takes its permissions from the Meta configuration, not from that variable. The API still rejects any scope other than `instagram_business_basic` in that variable.

Leave the app id, secret, and configuration id empty until they exist. The API still starts. **Connect account** then returns `INSTAGRAM_NOT_CONFIGURED`.

When the configuration id is set, the redirect must be `https`. A non-empty configuration id with `http://localhost` prevents the API from starting.

The encryption key must be 32 bytes after base64 decoding and must not be the same string as `JWT_ACCESS_SECRET`.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Restart the API after changing `backend/.env`.

## What the server does

1. `GET /api/v1/instagram/connect` returns:

   `https://www.facebook.com/dialog/oauth?client_id=...&config_id=...&redirect_uri=...&response_type=code&state=...&prompt=login`

   The URL has no `scope` and no app secret. `state` is random, stored as a SHA-256 hash, single-use, valid for 10 minutes, and bound to the signed-in Followly user.

2. Meta redirects to `/api/v1/instagram/callback`. The API exchanges the code on the server:

   `GET https://graph.facebook.com/v27.0/oauth/access_token`

   The exchange sends the Meta app id, app secret, redirect URI, and code.

3. The token is kept only when `instagram_basic` is granted. The API then calls `GET /me/assigned_instagram_accounts`. Zero shared accounts returns `account_missing`. More than one returns `multiple_accounts`. The token is not saved in either case.
4. One shared account is read from `GET /{instagram-account-id}` on `graph.facebook.com`. `/me` is the business integration system user, not the Instagram account.
5. `expires_in` is stored when Meta returns a positive integer. A missing or zero `expires_in` is stored as no expiry. Followly does not invent 60 days and does not refresh this token with the Instagram long-lived refresh endpoint.
6. The browser returns to `followly://instagram-connect?result=connected` or `result=error&reason=...`. The deep link does not contain the token or the secret.

A cancelled prompt (`error=access_denied`) shows a cancellation and does not create an account.

## Disconnect

`POST /api/v1/instagram/accounts/:id/disconnect` deletes the encrypted token and marks the row `disconnected`. The response stays `remoteAuthorizationRevoked: false`. Meta's Unified Login docs describe removing the app from the business portfolio; Followly does not call an undocumented revoke endpoint. Disconnecting Instagram does not sign the person out of Followly.

## Older Instagram Login path

Leave `META_INSTAGRAM_CONFIG_ID` empty and set the Instagram app id, Instagram app secret, and `META_INSTAGRAM_SCOPES=instagram_business_basic`. Outside production, the redirect may be `http://localhost:3000/api/v1/instagram/callback` or `http://127.0.0.1` with the same path. That path exchanges a short-lived token, then a long-lived token, and reads `graph.instagram.com/{version}/me`. A long-lived token can be refreshed only after 24 hours, while it is still valid, and only when it expires within 7 days. New apps do not show this setup.

## Automated tests

`backend/test/instagram.e2e-spec.ts` mocks both logins. It does not call Meta and it does not use a real token.
