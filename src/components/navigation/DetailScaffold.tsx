import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

type DetailScaffoldProps = {
  title: string;
  children: ReactNode;
  /** Pinned under the scroll area, such as a composer. */
  footer?: ReactNode;
  /** Centre the content vertically, for single-message screens. */
  centered?: boolean;
};

export function DetailScaffold({ title, children, footer, centered = false }: DetailScaffoldProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon={<ChevronLeft />}
          accessibilityLabel={t('nav.back')}
          variant="bare"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/');
          }}
          testID="go-back"
        />
        <Typography
          variant="title"
          style={styles.title}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Typography>
        <View style={styles.spacer} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          centered ? styles.centered : null,
          { paddingBottom: (footer ? spacing.lg : insets.bottom) + spacing.xxl },
        ]}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
