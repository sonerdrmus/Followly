import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark, Wordmark } from '@/components/launch/BrandMark';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type AuthScreenProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Pinned to the bottom, under a hairline: the switch to the other form. */
  footer?: ReactNode;
};

export function AuthScreen({ title, description, children, footer }: AuthScreenProps) {
  const { width } = useWindowDimensions();
  const horizontal = width < 360 ? spacing.lg : spacing.xl;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontal }]}
        >
          <View style={styles.header}>
            <BrandMark size={64} />
            <Wordmark size={40} />
          </View>
          <View style={styles.intro}>
            <Typography variant="h2" accessibilityRole="header" style={styles.center}>
              {title}
            </Typography>
            <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
              {description}
            </Typography>
          </View>
          <View style={styles.form}>{children}</View>
        </ScrollView>
        {footer ? (
          <View style={[styles.footer, { paddingHorizontal: horizontal }]}>{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  intro: {
    gap: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    alignItems: 'stretch',
  },
});
