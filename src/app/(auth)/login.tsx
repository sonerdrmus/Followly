import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import {
  hasFieldErrors,
  normalizeEmail,
  validateLogin,
  type FieldErrors,
} from '@/lib/auth/validation';
import { translateMaybe } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { ApiError } from '@/lib/api/types';
import { useAuthStore } from '@/stores/auth-store';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function submit() {
    const next = validateLogin({ email, password });
    setFields(next);
    setFormError(null);
    if (hasFieldErrors(next)) {
      return;
    }

    try {
      await login({ email: normalizeEmail(email), password });
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        setFields(
          /password/i.test(error.message) && !/email/i.test(error.message)
            ? { password: 'auth.passwordWeak' }
            : { email: 'auth.emailInvalid' },
        );
        return;
      }
      setFormError(useAuthStore.getState().error ?? 'auth.signInFailed');
    }
  }

  return (
    <AuthScreen
      title={t('auth.welcomeTitle')}
      description={t('auth.welcomeBody')}
      footer={
        <Button
          label={t('auth.createAccount')}
          variant="outline"
          shape="pill"
          fullWidth
          onPress={() => router.push('/register')}
          testID="go-register"
        />
      }
    >
      {formError ? <FormError message={translateMaybe(t, formError) ?? formError} /> : null}
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={translateMaybe(t, fields.email)}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        testID="login-email"
      />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        error={translateMaybe(t, fields.password)}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        testID="login-password"
      />
      <Button
        label={t('auth.signIn')}
        shape="pill"
        fullWidth
        loading={loading}
        onPress={() => void submit()}
        testID="login-submit"
      />
      <Link href="/forgot-password" style={styles.forgot}>
        <Typography variant="bodySmall" color={colors.textPrimary} strong>
          {t('auth.forgot')}
        </Typography>
      </Link>
    </AuthScreen>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <View style={styles.error}>
      <Typography variant="bodySmall" color={colors.danger}>
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  error: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
  },
});
