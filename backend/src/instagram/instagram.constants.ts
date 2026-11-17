/** Permission required for a professional profile and its public counts. */
export const INSTAGRAM_BUSINESS_BASIC = 'instagram_business_basic';

/** Profile permission for Instagram API with Unified Login. */
export const INSTAGRAM_BASIC = 'instagram_basic';

/** Account types documented for Instagram API with Instagram Login. */
export const SUPPORTED_ACCOUNT_TYPES = ['Business', 'Media_Creator'] as const;

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Meta will not refresh a long-lived token during its first day. */
export const TOKEN_REFRESH_MIN_AGE_MS = 24 * 60 * 60 * 1000;

/** Refresh only when expiry is inside this window, so sync does not refresh early. */
export const TOKEN_REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const APP_RETURN_URL = 'followly://instagram-connect';

export const RETURN_REASONS = [
  'state_invalid',
  'state_expired',
  'code_missing',
  'token_exchange_failed',
  'profile_failed',
  'unsupported_account',
  'duplicate_account',
  'permission_denied',
  'account_missing',
  'multiple_accounts',
  'not_configured',
  'meta_unavailable',
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

export const AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize';
export const CODE_EXCHANGE_URL = 'https://api.instagram.com/oauth/access_token';
export const LONG_LIVED_URL = 'https://graph.instagram.com/access_token';
export const REFRESH_URL = 'https://graph.instagram.com/refresh_access_token';

/** Facebook Login for Business dialog used by Instagram API with Unified Login. */
export const UNIFIED_AUTHORIZE_URL = 'https://www.facebook.com/dialog/oauth';

export const PROFILE_FIELDS = [
  'user_id',
  'username',
  'name',
  'account_type',
  'profile_picture_url',
  'followers_count',
  'follows_count',
  'media_count',
] as const;

/** IG User fields documented on graph.facebook.com. account_type is not in that list. */
export const UNIFIED_PROFILE_FIELDS = [
  'id',
  'username',
  'name',
  'profile_picture_url',
  'followers_count',
  'follows_count',
  'media_count',
] as const;
