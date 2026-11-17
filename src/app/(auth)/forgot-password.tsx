import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();

  return (
    <AuthScreen
      title={t('auth.resetTitle')}
      description={t('auth.resetBody')}
      footer={
        <Link href="/login" style={styles.link}>
          <Typography variant="bodySmall" color={colors.textPrimary} strong>
            {t('auth.backToSignIn')}
          </Typography>
        </Link>
      }
    >
      <Surface>
        <View style={styles.copy}>
          <Typography variant="title">{t('auth.recoveryTitle')}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('auth.recoveryBody')}
          </Typography>
        </View>
      </Surface>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: spacing.sm,
  },
  link: {
    minHeight: 44,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
