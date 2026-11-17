import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

import { TopBar } from './TopBar';

type TabScreenProps = {
  children: ReactNode;
  /** Header title. Omit for the wordmark. */
  title?: string;
  /** One quiet line under the header. */
  subtitle?: string;
  headerActions?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function TabScreen({
  children,
  title,
  subtitle,
  headerActions,
  refreshing = false,
  onRefresh,
}: TabScreenProps) {
  const { width } = useWindowDimensions();
  const horizontal = width < 360 ? spacing.md : spacing.lg;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <TopBar title={title} actions={headerActions} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontal }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surfaceRaised}
            />
          ) : undefined
        }
      >
        {subtitle ? (
          <View style={styles.intro}>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              {subtitle}
            </Typography>
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  intro: {
    marginBottom: -spacing.sm,
  },
});
