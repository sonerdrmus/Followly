import { SUPPORTED_ACCOUNT_TYPES } from './instagram.constants';
import {
  MetaInstagramError,
  type AssignedInstagramAccount,
  type InstagramProfile,
  type LongLivedToken,
  type ShortLivedToken,
  type UnifiedAccessToken,
} from './meta-instagram.types';

export function parseShortLivedToken(payload: unknown): ShortLivedToken {
  const record = firstRecord(payload);
  const accessToken = readString(record, 'access_token');
  const instagramUserId = readString(record, 'user_id');
  if (!accessToken || !instagramUserId) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  return {
    accessToken,
    instagramUserId,
    scopes: readScopes(record?.permissions),
  };
}

export function parseLongLivedToken(payload: unknown): LongLivedToken {
  const record = asRecord(payload);
  const accessToken = readString(record, 'access_token');
  const expiresIn = readCount(record?.expires_in);
  if (!accessToken || expiresIn === null || expiresIn <= 0) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  return { accessToken, expiresIn };
}

export function parseUnifiedAccessToken(payload: unknown): UnifiedAccessToken {
  const record = asRecord(payload);
  const accessToken = readString(record, 'access_token');
  if (!accessToken) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  const rawExpires = record?.expires_in;
  if (rawExpires === undefined || rawExpires === null || rawExpires === 0) {
    return { accessToken, expiresIn: null };
  }
  const expiresIn = readCount(rawExpires);
  if (expiresIn === null || expiresIn <= 0) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  return { accessToken, expiresIn };
}

export function parseGrantedPermissions(payload: unknown): string[] {
  const record = asRecord(payload);
  if (!record || !Array.isArray(record.data)) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  return record.data.flatMap((item) => {
    const row = asRecord(item);
    if (readString(row, 'status') !== 'granted') {
      return [];
    }
    const permission = readString(row, 'permission');
    return permission ? [permission] : [];
  });
}

export function parseAssignedInstagramAccounts(payload: unknown): AssignedInstagramAccount[] {
  const record = asRecord(payload);
  if (!record || !Array.isArray(record.data)) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }
  const nextPage = readString(asRecord(record.paging), 'next');
  if (nextPage) {
    throw new MetaInstagramError('MULTIPLE_ACCOUNTS');
  }
  return record.data.map((item) => {
    const row = asRecord(item);
    const id = readString(row, 'id');
    const username = readString(row, 'username');
    if (!id || !username) {
      throw new MetaInstagramError('UNEXPECTED_RESPONSE');
    }
    return { id, username };
  });
}

export function parseClientBusinessId(payload: unknown): string | null {
  return readString(asRecord(payload), 'client_business_id');
}

export function parseProfile(payload: unknown, fallbackUserId: string): InstagramProfile {
  const record = firstRecord(payload);
  const username = readString(record, 'username');
  const instagramUserId =
    readString(record, 'user_id') ?? readString(record, 'id') ?? fallbackUserId;
  if (!username || !instagramUserId) {
    throw new MetaInstagramError('UNEXPECTED_RESPONSE');
  }

  const accountType = readString(record, 'account_type');
  if (accountType && !supportedAccountTypes.has(accountType)) {
    throw new MetaInstagramError('UNSUPPORTED_ACCOUNT');
  }

  return {
    instagramUserId,
    username,
    displayName: readString(record, 'name'),
    accountType,
    profilePictureUrl: readString(record, 'profile_picture_url'),
    followersCount: readCount(record?.followers_count),
    followsCount: readCount(record?.follows_count),
    mediaCount: readCount(record?.media_count),
  };
}

const supportedAccountTypes = new Set<string>(SUPPORTED_ACCOUNT_TYPES);

function firstRecord(payload: unknown): Record<string, unknown> | null {
  const record = asRecord(payload);
  if (!record) {
    return null;
  }
  if (Array.isArray(record.data)) {
    return asRecord(record.data[0]);
  }
  return record;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readCount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}

function readScopes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (scope): scope is string => typeof scope === 'string' && scope.trim().length > 0,
    );
  }
  if (typeof value !== 'string') {
    return [];
  }
  return value
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
}
