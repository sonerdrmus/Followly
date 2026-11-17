export type InstagramConnectResult = 'connected' | 'cancelled' | 'error';

const results = new Set<InstagramConnectResult>(['connected', 'cancelled', 'error']);

export function readInstagramResult(value: string | null | undefined): {
  result: InstagramConnectResult;
  reason: string | null;
} | null {
  if (!value) {
    return null;
  }
  const queryIndex = value.indexOf('?');
  const query = queryIndex === -1 ? value : value.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const result = params.get('result');
  if (!result || !results.has(result as InstagramConnectResult)) {
    return null;
  }
  return { result: result as InstagramConnectResult, reason: params.get('reason') };
}

export function instagramResultMessage(reason: string | null): string {
  switch (reason) {
    case 'state_invalid':
    case 'state_expired':
      return 'That Instagram sign-in expired. Start it again.';
    case 'code_missing':
      return 'Instagram did not finish sign-in. Nothing was connected.';
    case 'token_exchange_failed':
      return 'Instagram did not confirm the sign-in. Nothing was connected.';
    case 'profile_failed':
    case 'meta_unavailable':
      return 'Instagram could not be reached. Nothing was connected.';
    case 'unsupported_account':
      return 'Instagram Login supports Business and Creator accounts. This account was not connected.';
    case 'duplicate_account':
      return 'This Instagram account is already connected to another Followly account.';
    case 'permission_denied':
      return 'Instagram permission was not granted. Nothing was connected.';
    case 'not_configured':
      return 'Instagram sign-in is not configured on the server yet.';
    default:
      return 'Instagram could not be connected.';
  }
}
