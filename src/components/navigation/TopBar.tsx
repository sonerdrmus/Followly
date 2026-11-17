import { useRouter } from 'expo-router';
import { Bell, SquarePlus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Wordmark } from '@/components/launch/BrandMark';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { useQuickActions } from '@/stores/quick-actions-store';
import { colors, spacing } from '@/theme';

type TopBarProps = {
  /** Screen title. Omit to show the followly wordmark. */
  title?: string;
  /** Extra icon buttons, placed before the shared shortcuts. */
  actions?: ReactNode;
  /** Hide the shared create and notifications buttons. */
  minimal?: boolean;
};

export function TopBar({ title, actions, minimal = false }: TopBarProps) {
  const router = useRouter();
  const showQuickActions = useQuickActions((state) => state.show);
  const { t } = useTranslation();

  return (
    <View style={styles.bar}>
      <View style={styles.title}>
        {title ? (
          <Typography variant="h1" accessibilityRole="header" numberOfLines={1}>
            {title}
          </Typography>
        ) : (
          <Wordmark size={30} />
        )}
      </View>
      <View style={styles.actions}>
        {actions}
        {minimal ? null : (
          <>
            <IconButton
              variant="bare"
              icon={<SquarePlus />}
              accessibilityLabel={t('nav.shortcuts')}
              onPress={showQuickActions}
              testID="open-shortcuts"
            />
            <IconButton
              variant="bare"
              icon={<Bell />}
              accessibilityLabel={t('nav.notifications')}
              onPress={() => {
                router.push({ pathname: '/info', params: { topic: 'notifications' } });
              }}
              testID="header-notifications"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
