import { useCallback, type ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/theme';
import type { Follower } from '@/types/follower';

import { FollowerListItem } from './FollowerListItem';

type FollowerListProps = {
  followers: readonly Follower[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onPressItem: (follower: Follower) => void;
  header: ReactElement;
  empty: ReactElement;
};

export function FollowerList({
  followers,
  loading,
  refreshing,
  onRefresh,
  onPressItem,
  header,
  empty,
}: FollowerListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Follower }) => <FollowerListItem follower={item} onPress={onPressItem} />,
    [onPressItem],
  );

  return (
    <FlatList
      data={loading ? [] : [...followers]}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? <LoadingRows /> : empty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.textSecondary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surfaceRaised}
        />
      }
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={8}
    />
  );
}

function LoadingRows() {
  return (
    <View style={styles.loading}>
      {['a', 'b', 'c', 'd', 'e'].map((key) => (
        <View key={key} style={styles.loadingRow}>
          <Skeleton width={56} height={56} radiusSize={radius.full} />
          <View style={styles.loadingCopy}>
            <Skeleton width="45%" height={12} />
            <Skeleton width="70%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loading: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingCopy: {
    flex: 1,
    gap: spacing.sm,
  },
});
