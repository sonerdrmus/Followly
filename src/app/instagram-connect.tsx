import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Link2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { InstagramConnectionError } from '@/components/instagram/InstagramConnectionError';
import { InstagramDisconnectDialog } from '@/components/instagram/InstagramDisconnectDialog';
import { InstagramPermissionExplanation } from '@/components/instagram/InstagramPermissionExplanation';
import { InstagramProfileSummary } from '@/components/instagram/InstagramProfileSummary';
import { DetailScaffold } from '@/components/navigation/DetailScaffold';
import { Button } from '@/components/ui/Button';
import { GradientRing } from '@/components/ui/GradientRing';
import { Typography } from '@/components/ui/Typography';
import {
  activeInstagramAccount,
  instagramAccountsKey,
  useInstagramAccounts,
} from '@/hooks/use-instagram-account';
import { ApiError } from '@/lib/api/types';
import {
  disconnectInstagramAccount,
  startInstagramConnect,
  syncInstagramProfile,
} from '@/lib/api/instagram';
import type { MessageKey } from '@/i18n';
import { readInstagramResult } from '@/lib/instagram/result';
import { messageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

WebBrowser.maybeCompleteAuthSession();

const returnUrl = 'followly://instagram-connect';

export default function InstagramConnectScreen() {
  const accounts = useInstagramAccounts();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ result?: string; reason?: string }>();
  const account = activeInstagramAccount(accounts.data);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<'connect' | 'sync' | 'disconnect' | null>(null);
  const [confirming, setConfirming] = useState(false);

  const refreshAccounts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: instagramAccountsKey });
  }, [queryClient]);
  const refetchAccounts = accounts.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchAccounts();
      const parsed = readInstagramResult(resultQuery(params.result, params.reason));
      if (!parsed) {
        return;
      }
      if (parsed.result === 'connected') {
        setMessage(null);
        return;
      }
      if (parsed.result === 'cancelled') {
        setMessage(t('instagram.cancelled'));
        return;
      }
      setMessage(t(instagramReasonKey(parsed.reason)));
    }, [params.reason, params.result, refetchAccounts, t]),
  );

  async function connect() {
    setBusy('connect');
    setMessage(null);
    try {
      const session = await startInstagramConnect();
      const result = await WebBrowser.openAuthSessionAsync(session.authorizationUrl, returnUrl);
      if (result.type === 'success') {
        const parsed = readInstagramResult(result.url);
        if (parsed?.result === 'cancelled') {
          setMessage(t('instagram.cancelled'));
        } else if (parsed?.result === 'error') {
          setMessage(t(instagramReasonKey(parsed.reason)));
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        setMessage(t('instagram.cancelled'));
      }
      await refreshAccounts();
    } catch (error) {
      setMessage(t(instagramErrorKey(error)));
    } finally {
      setBusy(null);
    }
  }

  async function sync() {
    if (!account) {
      return;
    }
    setBusy('sync');
    setMessage(null);
    try {
      await syncInstagramProfile(account.id);
      await refreshAccounts();
    } catch (error) {
      setMessage(t(instagramErrorKey(error)));
      await refreshAccounts();
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    if (!account) {
      return;
    }
    setBusy('disconnect');
    setMessage(null);
    try {
      await disconnectInstagramAccount(account.id);
      setConfirming(false);
      await refreshAccounts();
    } catch (error) {
      setMessage(t(instagramErrorKey(error)));
    } finally {
      setBusy(null);
    }
  }

  const connected = account?.connectionStatus === 'connected';

  return (
    <DetailScaffold
      title={t('instagram.title')}
      footer={
        <View style={styles.actions}>
          {account ? (
            <>
              {connected ? (
                <Button
                  label={t('instagram.refresh')}
                  variant="secondary"
                  fullWidth
                  loading={busy === 'sync'}
                  onPress={() => {
                    void sync();
                  }}
                />
              ) : (
                <Button
                  label={t('instagram.connectAgain')}
                  fullWidth
                  loading={busy === 'connect'}
                  onPress={() => {
                    void connect();
                  }}
                />
              )}
              <Button
                label={t('instagram.disconnect')}
                variant="destructive"
                fullWidth
                loading={busy === 'disconnect'}
                onPress={() => setConfirming(true)}
              />
            </>
          ) : (
            <Button
              label={t('instagram.connect')}
              variant="premium"
              fullWidth
              loading={busy === 'connect'}
              onPress={() => {
                void connect();
              }}
              testID="connect-instagram"
            />
          )}
        </View>
      }
    >
      {accounts.isPending ? (
        <Typography variant="bodySmall" color={colors.textSecondary}>
          {t('instagram.checking')}
        </Typography>
      ) : null}
      {accounts.isError ? (
        <InstagramConnectionError message={t(instagramErrorKey(accounts.error))} />
      ) : null}
      {message ? <InstagramConnectionError message={message} /> : null}
      {account ? (
        <InstagramProfileSummary account={account} />
      ) : (
        <View style={styles.hero}>
          <GradientRing size={96} thickness={3} gap={4}>
            <View style={styles.core}>
              <Link2 color={colors.textPrimary} size={34} strokeWidth={1.6} />
            </View>
          </GradientRing>
          <Typography variant="h1" style={styles.center}>
            {t('instagram.heroTitle')}
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
            {t('instagram.heroBody')}
          </Typography>
        </View>
      )}
      {account ? null : <InstagramPermissionExplanation />}
      <InstagramDisconnectDialog
        visible={confirming}
        loading={busy === 'disconnect'}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          void disconnect();
        }}
      />
    </DetailScaffold>
  );
}

function resultQuery(
  result: string | string[] | undefined,
  reason: string | string[] | undefined,
): string | null {
  const value = Array.isArray(result) ? result[0] : result;
  if (!value) {
    return null;
  }
  const detail = Array.isArray(reason) ? reason[0] : reason;
  return detail ? `result=${value}&reason=${detail}` : `result=${value}`;
}

function instagramReasonKey(reason: string | null): MessageKey {
  const key = messageKey(reason ? `instagram.reason.${reason}` : '');
  return key ?? 'instagram.reason.meta_unavailable';
}

function instagramErrorKey(error: unknown): MessageKey {
  if (!(error instanceof ApiError)) {
    return 'instagram.reason.meta_unavailable';
  }
  switch (error.code) {
    case 'INSTAGRAM_NOT_CONFIGURED':
      return 'instagram.notConfigured';
    case 'TOKEN_EXPIRED':
      return 'instagram.expired';
    case 'TOKEN_REVOKED':
      return 'instagram.revoked';
    case 'INSTAGRAM_DISCONNECTED':
      return 'instagram.disconnected';
    case 'UNSUPPORTED_ACCOUNT':
      return 'instagram.unsupported';
    case 'META_UNAVAILABLE':
      return 'instagram.reason.meta_unavailable';
    case 'NETWORK':
    case 'TIMEOUT':
      return 'errors.offline';
    default:
      return 'errors.generic';
  }
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  core: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 568,
    alignSelf: 'center',
    gap: spacing.sm,
  },
});
