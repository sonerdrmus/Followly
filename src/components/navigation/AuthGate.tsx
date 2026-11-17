import { Redirect, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useOnboarding } from '@/hooks/use-onboarding';
import { translateMaybe } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { useAuthStore } from '@/stores/auth-store';
import { colors, spacing } from '@/theme';

export function AuthGate() {
  const segments = useSegments();
  const onboarding = useOnboarding();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const initialize = useAuthStore((state) => state.initialize);
  const { t } = useTranslation();
  const root = segments[0];
  const signedIn = status === 'authenticated' || (status === 'refreshing' && user !== null);

  if (status === 'error' && !signedIn) {
    return (
      <View style={styles.unavailable}>
        <Typography variant="h2" style={styles.center}>
          {t('errors.gateTitle')}
        </Typography>
        <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
          {translateMaybe(t, error) ?? t('errors.gateBody')}
        </Typography>
        <Button
          label={t('errors.tryAgain')}
          loading={loading}
          onPress={() => {
            void initialize();
          }}
        />
      </View>
    );
  }

  if (!onboarding.completed) {
    if (root !== 'onboarding') {
      return <Redirect href="/onboarding" />;
    }
    return null;
  }

  if (root === 'onboarding') {
    return <Redirect href={signedIn ? '/' : '/login'} />;
  }

  const inAuth = root === '(auth)';
  if (!signedIn && !inAuth && root !== 'design-system') {
    return <Redirect href="/login" />;
  }

  if (signedIn && inAuth) {
    return <Redirect href="/" />;
  }

  return null;
}

const styles = StyleSheet.create({
  unavailable: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
  },
  center: {
    textAlign: 'center',
  },
});
