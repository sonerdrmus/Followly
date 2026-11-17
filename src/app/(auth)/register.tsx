import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { translateMaybe } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { ApiError } from '@/lib/api/types';
import {
  hasFieldErrors,
  normalizeEmail,
  validateRegistration,
  type FieldErrors,
} from '@/lib/auth/validation';
import { useAuthStore } from '@/stores/auth-store';
import { colors, spacing } from '@/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fields, setFields] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function submit() {
    const next = validateRegistration({ displayName, email, password, confirmPassword });
    setFields(next);
    setFormError(null);
    if (hasFieldErrors(next)) {
      return;
    }

    try {
      await register({
        displayName: displayName.trim(),
        email: normalizeEmail(email),
        password,
      });
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_TAKEN') {
        setFields({ email: 'errors.emailTaken' });
        return;
      }
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        const next: FieldErrors = {};
        if (/display name/i.test(error.message)) {
          next.displayName = 'auth.displayNameRequired';
        }
        if (/email/i.test(error.message)) {
          next.email = 'auth.emailInvalid';
        }
        if (/password/i.test(error.message)) {
          next.password = 'auth.passwordWeak';
        }
        if (hasFieldErrors(next)) {
          setFields(next);
          return;
        }
      }
      setFormError(useAuthStore.getState().error ?? 'auth.registerFailed');
    }
  }

  return (
    <AuthScreen
      title={t('auth.registerTitle')}
      description={t('auth.registerBody')}
      footer={
        <Button
          label={t('auth.haveAccount')}
          variant="outline"
          shape="pill"
          fullWidth
          onPress={() => router.replace('/login')}
          testID="go-login"
        />
      }
    >
      {formError ? (
        <View style={styles.error}>
          <Typography variant="bodySmall" color={colors.danger}>
            {translateMaybe(t, formError) ?? formError}
          </Typography>
        </View>
      ) : null}
      <TextField
        label={t('auth.displayName')}
        value={displayName}
        onChangeText={setDisplayName}
        error={translateMaybe(t, fields.displayName)}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        testID="register-name"
      />
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={translateMaybe(t, fields.email)}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        testID="register-email"
      />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        error={translateMaybe(t, fields.password)}
        secureTextEntry
        autoComplete="password"
        textContentType="newPassword"
        testID="register-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={translateMaybe(t, fields.confirmPassword)}
        secureTextEntry
        textContentType="newPassword"
        testID="register-confirm"
      />
      <Button
        label={t('auth.createAccountButton')}
        shape="pill"
        fullWidth
        loading={loading}
        onPress={() => void submit()}
        testID="register-submit"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
  },
});
