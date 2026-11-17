# Followly — Project Plan

Followly is a premium iOS and Android app for Instagram analytics and follower tracking. The interface direction is dark and quiet: a deep green background, an electric blue primary, a gold second color, rounded cards, and small amounts of motion.

This document separates what exists in the repository from what is only planned. The mobile app, Followly authentication, and a professional Instagram connection are implemented. Import, comparison, AI, and subscriptions are only planned.

## Product vision

People who care about an Instagram account need a clear view of how that account is changing. Followly is intended to show audience movement and content performance in one focused mobile app.

Two data sources are planned, and both stay inside the account owner's own access:

- Official Meta APIs for the Instagram professional-account data those APIs actually grant.
- An export the user downloads from Instagram and then provides to Followly, used where the official API does not return the follower and following lists needed for comparison.

The app does not collect Instagram passwords, session cookies, or data scraped from Instagram. It does not invent analytics or AI progress.

## Mobile technology stack

Implemented in Phase 1:

| Area         | Choice                                     | Status                                  |
| ------------ | ------------------------------------------ | --------------------------------------- |
| App runtime  | Expo SDK 58, React Native 0.88, React 19.3 | Installed                               |
| Language     | TypeScript, strict mode                    | Configured                              |
| Navigation   | Expo Router, routes in `src/app`           | Splash, onboarding, and five-tab dashboard |
| Styling      | NativeWind 4.2 and Tailwind CSS 3          | Configured                              |
| Theme        | Tokens in `src/theme`                      | Used by the welcome screen              |
| Motion       | React Native Reanimated                    | Subtle welcome entrance                 |
| Server state | TanStack Query                             | Provider configured; auth calls use the API client |
| Client state | Zustand                                    | Auth session store, not yet shown in a screen |
| Images       | Expo Image                                 | Installed, unused                       |
| Icons        | Lucide React Native and `react-native-svg` | Installed, unused on the welcome screen |
| Quality      | ESLint and Prettier                        | Configured                              |

The app targets Expo SDK 58 so it opens in the current Expo Go app on a physical iPhone. NativeWind 4.2.7 stays in place.

### Source layout

```text
src/app/            Expo Router screens and layouts
src/components/     Shared UI, empty in Phase 1
src/constants/      App constants, empty in Phase 1
src/hooks/          Shared hooks, empty in Phase 1
src/lib/            Clients and cross-cutting setup
src/stores/         Zustand stores, empty in Phase 1
src/theme/          Color, spacing, and typography tokens
src/types/          Shared types, empty in Phase 1
src/utils/          Pure helpers, empty in Phase 1
assets/             Icons, images, and fonts
docs/               Project documentation
```

`src/theme` is the only theme system. Tailwind repeats the same palette so NativeWind utilities stay aligned with those tokens. Components use the tokens or those utilities.

The first launch plays a short branded splash, then a three-screen onboarding flow. Completing or skipping onboarding is stored on the device, and later launches go to the welcome screen. That screen shows the Followly mark and the line "Your Instagram growth, understood." It is not a dashboard. The development showcase remains at `src/app/design-system.tsx` and is not part of this flow.

## Planned NestJS backend architecture

No backend exists.

The API is a NestJS service owned by Followly. The mobile app calls it through TanStack Query. Instagram app secrets and long-lived tokens stay on the server.

Planned module boundaries, none of which exist yet:

- Account and session handling for the Followly user.
- Instagram connection and official API sync.
- Import of a user-provided Instagram export.
- Stored snapshots and comparison results.
- AI recommendations built from stored data.
- Subscription status.

`.env.example` reserves `EXPO_PUBLIC_API_URL` for that future client. The variable is unused.

## Planned PostgreSQL and Prisma

No database client is installed.

The planned store is PostgreSQL, accessed from the NestJS API through Prisma. Planned records include the Followly user, a connected professional Instagram account, imported follower and following snapshots, comparison results derived from those snapshots, official insight snapshots, and subscription state.

Prisma is not a dependency. There is no schema and no migration.

## Official Meta Instagram API integration

Connecting a Business or Creator account is implemented. Unified Login asks the Meta configuration for the profile permission `instagram_basic`. The older Instagram Login path asks for `instagram_business_basic`. The server exchanges the code, encrypts the token, and stores the professional profile. Insights, media lists, and follower lists are not synced. Setup that still has to be done in a Meta Developer account is documented in `docs/META_INSTAGRAM_SETUP.md`. App Review has not been requested.

The official API is the source for supported professional-account insights and media data. It is not a planned source for unofficial follower graphs, scraped profiles, or any data the user cannot authorize.

Endpoint names are intentionally unset. They will be chosen when the integration is approved, against the API surface Meta documents at that time.

## Planned Instagram data export import

No importer exists.

Instagram lets an account owner download their information. The planned Followly flow is that the user obtains that JSON or ZIP export from Instagram and provides it to Followly. The NestJS API would parse the export, keep the follower and following lists as snapshots, and use those snapshots for comparison.

This import is how Followly plans to see follower and following changes that the official API does not provide. The parser will follow Instagram's export format at implementation time. Phase 1 does not guess that format or ship sample results.

The user provides their own export. Followly does not ask for an Instagram password or a session cookie in order to collect it.

## Planned follower comparison engine

No comparison code exists.

The planned engine compares stored snapshots of the same account, primarily from the user's imports and from official API fields where those fields exist. A later snapshot compared with an earlier one can show accounts that were added or removed in the follower list and the following list.

Every result must come from stored data. The app will not show a comparison, a count, or a change that was not computed from that data.

## Planned Followly AI learning and recommendation system

No model, prompt, provider, or learning state exists.

The planned system runs on the server. It would read the user's stored official insights and comparison history, then return recommendations about that history. The mobile app would display those results. It would not invent a learning score, a training progress bar, or a recommendation before real data exists.

The provider and the model are not chosen.

## Planned subscription infrastructure

No billing SDK is installed. RevenueCat is not a dependency.

A later phase can add a subscription so some analytics, history, or recommendations are paid features. The provider, products, and entitlements are undecided. Until that work is approved, the app has no purchase flow and no locked premium content.

## Product constraints

These rules apply to every later phase:

- Official Meta APIs are the only network source for Instagram account data.
- Follower and following comparisons that the API cannot supply come from an export the user provides.
- The product does not collect Instagram passwords.
- The product does not scrape Instagram.
- The product does not collect Instagram session cookies.
- The product does not display analytics that were not computed from authorized data.
- The product does not display AI learning progress or recommendations that were not produced from stored data.

## Development phases

### Phase 1 — Project foundation

Status: complete.

The Expo app, `src/app` router, NativeWind, Reanimated, TanStack Query, Zustand, lint, and this plan are in place.

### Phase 2 — Design system

Status: complete.

Tokens, type, surfaces, controls, charts, and the development showcase at `src/app/design-system.tsx`. Preview values on that screen are labeled samples. The route is not part of product navigation.

### Phase 3 — Splash and onboarding

Status: complete.

A short in-app splash follows the native dark splash. Three onboarding screens introduce growth, audience comparison, and Followly AI. Audience comparison is described as export snapshots, not a complete follower list from the official API. The AI screen does not claim an account has been analyzed. Skip, Back, Next, and Get Started are available as specified. Completion is stored with AsyncStorage under `followly.onboarding.completed`. After completion, the app opens the home dashboard and does not show onboarding again.

### Phase 4 — Dashboard and navigation

Status: complete.

Five tabs — Home, Followers, Analytics, AI, and Profile — use a custom bottom bar. The home dashboard shows a connection card, empty account metrics, an empty growth chart, follower-activity previews, an AI preview, and quick access. Other tabs are visual foundations with readiness states. No follower, analytics, or AI result is invented. Connect Account starts the configured Instagram connection, which stays disconnected until Meta confirms an account.

### Phase 5 — Followers and analytics UI

Status: complete as interface only.

The Followers tab has an overview, five relationship categories, search, sort, filters, a virtualized list, and a detail sheet. The Analytics tab has a metric overview, time ranges, an audience growth chart, engagement, content order, reach versus impressions, and story insights. Every number and profile stays empty until a clearly labeled development fixture is turned on. Fixture records are sample data, not the user’s Instagram account. Official Insights, imported exports, and snapshot comparisons are named as sources. Missing metrics stay unavailable. This phase does not connect Instagram, import a file, or compare real snapshots.

### Phase 6 — Backend foundation

Status: complete.

`backend/` is a NestJS API with PostgreSQL, Prisma, Redis, and a BullMQ connection. Email registration and login issue a short-lived JWT and a rotating hashed refresh token. Swagger documents the auth, Instagram, and health routes. The Expo app has a typed API client and a Zustand auth store. SecureStore holds Followly tokens on a device. Instagram access tokens stay encrypted on the server. No import job or comparison engine is included.

### Phase 7 — Authentication UI

Status: complete.

The Expo app signs in and creates accounts through the existing `/api/v1/auth` routes. Registration does not return tokens, so a successful registration is followed by login. Access and refresh tokens stay in SecureStore on a device. A single refresh request is shared by concurrent unauthorized calls, and a failed refresh is not retried in a loop. Onboarding completion stays separate from the signed-in session. Password recovery is not available because the API has no reset endpoint.

### Phase 8 — Instagram Login

Status: complete as an integration, pending a Meta app.

An authenticated Followly user can connect a Business or Creator account. When `META_INSTAGRAM_CONFIG_ID` is set, the server uses Instagram API with Unified Login: Facebook Login for Business, `config_id`, and `graph.facebook.com`. When it is empty, the server keeps Instagram API with Instagram Login. The server owns the OAuth state, the code exchange, and the encrypted token. The app shows the synced profile and can disconnect the local token. Real Meta credentials, a tester account, and App Review for other people's accounts are still manual. Insights, imports, comparison, AI, subscriptions, and push are not part of this phase.

### Later phases

Status: not started.

Export import processing, the comparison engine, AI recommendations, subscriptions, and push notifications wait for approval.

## Current completed phase

Phase 1, the project foundation, Phase 2, the design system, Phase 3, splash and onboarding, Phase 4, the dashboard and tab navigation, Phase 5, the followers and analytics interface, Phase 6, the backend foundation, Phase 7, mobile authentication, and Phase 8, Instagram account connection, are complete.

## Remaining work

Export import processing, the comparison engine, AI recommendations, subscriptions, and push notifications are not started. A real Instagram sign-in still needs the owner's Meta Developer setup.
