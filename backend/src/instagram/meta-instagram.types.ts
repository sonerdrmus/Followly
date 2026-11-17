export type ShortLivedToken = {
  accessToken: string;
  instagramUserId: string;
  scopes: string[];
};

export type LongLivedToken = {
  accessToken: string;
  expiresIn: number;
};

export type UnifiedAccessToken = {
  accessToken: string;
  expiresIn: number | null;
};

export type AssignedInstagramAccount = {
  id: string;
  username: string;
};

export type InstagramProfile = {
  instagramUserId: string;
  username: string;
  displayName: string | null;
  accountType: string | null;
  profilePictureUrl: string | null;
  followersCount: number | null;
  followsCount: number | null;
  mediaCount: number | null;
};

export class MetaInstagramError extends Error {
  readonly code:
    | 'TOKEN_EXCHANGE_FAILED'
    | 'PROFILE_FAILED'
    | 'REFRESH_FAILED'
    | 'META_UNAVAILABLE'
    | 'UNEXPECTED_RESPONSE'
    | 'UNSUPPORTED_ACCOUNT'
    | 'TOKEN_INVALID'
    | 'ACCOUNT_MISSING'
    | 'MULTIPLE_ACCOUNTS';

  constructor(code: MetaInstagramError['code']) {
    super(code);
    this.name = 'MetaInstagramError';
    this.code = code;
  }
}
