import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ArrowDownUp, CloudOff, SearchX, SlidersHorizontal, UsersRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataSourceLabel } from '@/components/analytics/DataSourceLabel';
import { FollowerCategoryTabs } from '@/components/followers/FollowerCategoryTabs';
import { FollowerDetailSheet } from '@/components/followers/FollowerDetailSheet';
import { FollowerFilters, sortLabels } from '@/components/followers/FollowerFilters';
import { FollowerList } from '@/components/followers/FollowerList';
import { FollowerOverview } from '@/components/followers/FollowerOverview';
import { FollowerSearch } from '@/components/followers/FollowerSearch';
import { TopBar } from '@/components/navigation/TopBar';
import { SampleDataControls } from '@/components/status/SampleDataControls';
import { FeatureEmptyState } from '@/components/status/FeatureEmptyState';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { categoryCopy } from '@/content/follower-categories';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { followerDataset } from '@/data/follower-view';
import { colors, spacing } from '@/theme';
import type { Follower, FollowerSort, RelationshipType } from '@/types/follower';
import { sourceLabels } from '@/types/provenance';
import { dateSortAvailable, queryFollowers } from '@/utils/follower-query';
import { Touchable } from '@/components/ui/Touchable';

export default function FollowersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState(false);
  const [category, setCategory] = useState<RelationshipType>('new');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FollowerSort>('username-asc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [namedOnly, setNamedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Follower | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const dataset = followerDataset(preview && !errorPreview);
  const sourceItems = dataset.groups[category];
  const datesAvailable = dateSortAvailable(sourceItems, category);
  const activeSort: FollowerSort =
    !datesAvailable && (sort === 'newest' || sort === 'oldest') ? 'username-asc' : sort;
  const verifiedFilterEnabled = sourceItems.some((item) => item.verified !== null);
  const results = queryFollowers(sourceItems, category, {
    search,
    sort: activeSort,
    verifiedOnly: verifiedOnly && verifiedFilterEnabled,
    namedOnly,
  });
  const copy = categoryCopy[category];
  const filterCount = (verifiedOnly && verifiedFilterEnabled ? 1 : 0) + (namedOnly ? 1 : 0);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setNotice(preview ? t('followers.reloadedSample') : t('followers.refreshEmpty'));
    }, 450);
  }, [preview, t]);

  const onPressItem = useCallback((follower: Follower) => {
    setSelected(follower);
  }, []);

  const clearQuery = useCallback(() => {
    setSearch('');
    setVerifiedOnly(false);
    setNamedOnly(false);
  }, []);

  const header = useMemo(() => {
    const counts =
      preview && !errorPreview
        ? {
            new: dataset.groups.new.length,
            lost: dataset.groups.lost.length,
            not_following_back: dataset.groups.not_following_back.length,
            not_followed_back: dataset.groups.not_followed_back.length,
            mutual: dataset.groups.mutual.length,
          }
        : null;

    return (
      <View style={styles.header}>
        <FollowerOverview
          totals={dataset.totals}
          sourceLabel={
            dataset.provenance.source
              ? sourceLabels[dataset.provenance.source]
              : 'Connect an account or import a snapshot'
          }
        />
        <DataSourceLabel provenance={dataset.provenance} />
        {notice ? (
          <Typography variant="caption" color={colors.textMuted}>
            {notice}
          </Typography>
        ) : null}
        <SampleDataControls
          enabled={preview}
          errorPreview={errorPreview}
          onToggleSample={() => {
            setPreview((current) => !current);
            setErrorPreview(false);
            setNotice(null);
          }}
          onToggleError={() => setErrorPreview((current) => !current)}
        />
        <FollowerCategoryTabs value={category} counts={counts} onChange={setCategory} />
        <FollowerSearch value={search} onChange={setSearch} />
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('followers.sortOpen', { label: t(sortLabels[activeSort]) })}
          onPress={() => setFiltersOpen(true)}
          testID="open-filters"
          style={({ pressed }) => [styles.sortRow, pressed ? styles.pressed : null]}
        >
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('followers.sortBy')}{' '}
            <Typography variant="bodySmall" strong>
              {t(sortLabels[activeSort])}
            </Typography>
            {filterCount > 0
              ? `  ·  ${filterCount === 1 ? t('followers.oneFilter') : t('followers.manyFilters', { n: filterCount })}`
              : ''}
          </Typography>
          <ArrowDownUp color={colors.textPrimary} size={18} strokeWidth={2} />
        </Touchable>
        <Typography variant="caption" color={colors.textMuted}>
          {t(`followers.category.${category}.summary` as MessageKey)}
        </Typography>
      </View>
    );
  }, [activeSort, category, t, dataset, errorPreview, filterCount, notice, preview, search]);

  const empty = useMemo(() => {
    if (errorPreview) {
      return (
        <FeatureEmptyState
          icon={<CloudOff />}
          title={t('followers.errorTitle')}
          description={t('followers.errorBody')}
          status="ERROR"
          action={
            <Button
              label={t('common.retry')}
              variant="secondary"
              onPress={() => setErrorPreview(false)}
              testID="retry-error"
            />
          }
        />
      );
    }

    if (sourceItems.length === 0) {
      return (
        <FeatureEmptyState
          icon={<UsersRound />}
          title={t(`followers.category.${category}.emptyTitle` as MessageKey)}
          description={t(`followers.category.${category}.emptyBody` as MessageKey)}
          status={copy.status}
          action={
            <View style={styles.actions}>
              <Button
                label={t('followers.connect')}
                fullWidth
                onPress={() => router.push('/connect-account')}
              />
              <Button
                label={t('followers.whySnapshot')}
                variant="secondary"
                fullWidth
                onPress={() => router.push({ pathname: '/info', params: { topic: 'snapshots' } })}
              />
            </View>
          }
        />
      );
    }

    return (
      <FeatureEmptyState
        icon={<SearchX />}
        title={t('followers.noMatch')}
        description={t('followers.noMatchBody')}
        status="READY"
        action={
          <Button label={t('followers.clear')} variant="secondary" fullWidth onPress={clearQuery} />
        }
      />
    );
  }, [category, clearQuery, copy, errorPreview, router, sourceItems.length, t]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <TopBar
        title={t('followers.title')}
        actions={
          <IconButton
            variant="bare"
            icon={<SlidersHorizontal />}
            accessibilityLabel={t('followers.sort')}
            dot={filterCount > 0}
            onPress={() => setFiltersOpen(true)}
            testID="header-filters"
          />
        }
      />
      <FollowerList
        followers={results}
        loading={refreshing}
        refreshing={refreshing}
        onRefresh={refresh}
        onPressItem={onPressItem}
        header={header}
        empty={empty}
      />
      <FollowerFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sort={activeSort}
        onSort={setSort}
        verifiedOnly={verifiedOnly}
        namedOnly={namedOnly}
        onVerifiedOnly={setVerifiedOnly}
        onNamedOnly={setNamedOnly}
        dateSortEnabled={datesAvailable}
        verifiedFilterEnabled={verifiedFilterEnabled}
      />
      <FollowerDetailSheet
        follower={selected}
        provenance={dataset.provenance}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sortRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.55,
  },
  actions: {
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
});
