import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function createRefreshToken(): { raw: string; tokenHash: string } {
  const raw = randomBytes(32).toString('base64url');
  return { raw, tokenHash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function tokenHashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

const durationMs: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function durationToMs(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error('Invalid duration');
  }
  return Number(match[1]) * durationMs[match[2]];
}

export function durationToSeconds(value: string): number {
  return Math.floor(durationToMs(value) / 1000);
}
