import { useRouter } from 'expo-router';
import { CloudOff, Images } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { AnalyticsTimeRange } from '@/components/analytics/AnalyticsTimeRange';
import { AudienceGrowthChart } from '@/components/analytics/AudienceGrowthChart';
import { ContentPerformanceCard } from '@/components/analytics/ContentPerformanceCard';
import { DataSourceLabel } from '@/components/analytics/DataSourceLabel';
import { EngagementSection } from '@/components/analytics/EngagementSection';
import { MetricInfoTooltip } from '@/components/analytics/MetricInfoTooltip';
import { StoryInsightsSection } from '@/components/analytics/StoryInsightsSection';
import { TabScreen } from '@/components/navigation/TabScreen';
import { SampleDataControls } from '@/components/status/SampleDataControls';
import { FeatureEmptyState } from '@/components/status/FeatureEmptyState';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { SegmentedControl } from '@/components/analytics/SegmentedControl';
import { analyticsDataset } from '@/data/analytics-view';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { GrowthRange } from '@/types/account';
import type { ContentPerformance } from '@/types/analytics';

const rangeCopy: Record<GrowthRange, MessageKey> = {
  '7D': 'analytics.range7D',
  '30D': 'analytics.range30D',
  '90D': 'analytics.range90D',
  '1Y': 'analytics.range1Y',
};

const contentModes = ['Top posts', 'Recent posts', 'Most engaging'] as const;
type ContentMode = (typeof contentModes)[number];
const reachModes = ['Reach trend', 'Impressions trend'] as const;
type ReachMode = (typeof reachModes)[number];

const contentLabels: Record<ContentMode, MessageKey> = {
  'Top posts': 'analytics.modeTop',
  'Recent posts': 'analytics.modeRecent',
  'Most engaging': 'analytics.modeEngaging',
};

const reachLabels: Record<ReachMode, MessageKey> = {
  'Reach trend': 'analytics.modeReach',
  'Impressions trend': 'analytics.modeImpressions',
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [preview, setPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState(false);
  const [range, setRange] = useState<GrowthRange>('30D');
  const [contentMode, setContentMode] = useState<ContentMode>('Top posts');
  const [reachMode, setReachMode] = useState<ReachMode>('Reach trend');
  const [infoKey, setInfoKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const dataset = analyticsDataset(preview && !errorPreview);
  const growth = dataset.growth[range];
  const reachPoints =
    reachMode === 'Reach trend' ? dataset.reachSeries[range] : dataset.impressionSeries[range];
  const posts = useMemo(() => orderPosts(dataset.posts, contentMode), [contentMode, dataset.posts]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setNotice(
        preview
          ? 'Reloaded the local sample. Nothing was fetched from Instagram.'
          : 'Refresh finished. No account or insights are available.',
      );
    }, 450);
  }, [preview]);

  return (
    <>
      <TabScreen title={t('analytics.title')} refreshing={refreshing} onRefresh={refresh}>
        <View style={styles.top}>
          <AnalyticsTimeRange value={range} onChange={setRange} />
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
        </View>
        {errorPreview ? (
          <FeatureEmptyState
            icon={<CloudOff />}
            title={t('analytics.failed')}
            description={t('analytics.errorBody')}
            status="ERROR"
            action={
              <Button
                label={t('common.retry')}
                variant="secondary"
                onPress={() => setErrorPreview(false)}
              />
            }
          />
        ) : (
          <>
            <AnalyticsOverview metrics={dataset.overview} onInfo={setInfoKey} />
            <View style={styles.section}>
              <SectionHeader
                title={t('analytics.growth')}
                subtitle={t('analytics.growthRange', { range: t(rangeCopy[range]) })}
              />
              <AudienceGrowthChart
                points={refreshing ? [] : growth}
                loading={refreshing}
                sample={dataset.preview}
                emptyMessage={t('analytics.emptyRange', { range: t(rangeCopy[range]) })}
              />
            </View>
            <EngagementSection metrics={dataset.engagement} onInfo={setInfoKey} />
            <View style={styles.section}>
              <SectionHeader title={t('analytics.content')} />
              <Typography variant="caption" color={colors.textSecondary}>
                {t('analytics.contentBody')}
              </Typography>
              <SegmentedControl
                options={contentModes}
                value={contentMode}
                onChange={setContentMode}
                accessibilityLabel={t('analytics.order')}
                label={(option) => t(contentLabels[option])}
              />
              {posts.length === 0 ? (
                <FeatureEmptyState
                  icon={<Images />}
                  title={t('analytics.noPosts')}
                  description={t('analytics.noPostsBody')}
                  status="UNAVAILABLE"
                  action={
                    <Button
                      label={t('analytics.aboutAccess')}
                      variant="secondary"
                      fullWidth
                      onPress={() =>
                        router.push({ pathname: '/info', params: { topic: 'insights-access' } })
                      }
                    />
                  }
                />
              ) : (
                <Surface padding={0}>
                  {posts.map((post, index) => (
                    <View key={post.id}>
                      {index > 0 ? <Divider inset={96} /> : null}
                      <ContentPerformanceCard post={post} />
                    </View>
                  ))}
                </Surface>
              )}
            </View>
            <View style={styles.section}>
              <SectionHeader title={t('analytics.reach')} />
              <Typography variant="caption" color={colors.textSecondary}>
                {t('analytics.reachBody')}
              </Typography>
              <SegmentedControl
                options={reachModes}
                value={reachMode}
                onChange={setReachMode}
                accessibilityLabel={t('analytics.reachToggle')}
                label={(option) => t(reachLabels[option])}
              />
              <AudienceGrowthChart
                points={refreshing ? [] : reachPoints}
                loading={refreshing}
                sample={dataset.preview}
                emptyMessage={t('analytics.fieldEmpty', {
                  metric: t(
                    reachMode === 'Reach trend'
                      ? 'metrics.reach.title'
                      : 'metrics.impressions.title',
                  ),
                  range: t(rangeCopy[range]),
                })}
              />
            </View>
            <StoryInsightsSection metrics={dataset.stories} onInfo={setInfoKey} />
          </>
        )}
      </TabScreen>
      <MetricInfoTooltip metricKey={infoKey} onClose={() => setInfoKey(null)} />
    </>
  );
}

function orderPosts(
  posts: readonly ContentPerformance[],
  mode: ContentMode,
): readonly ContentPerformance[] {
  const copy = [...posts];
  if (mode === 'Recent posts') {
    copy.sort((left, right) => time(right.publishedAt) - time(left.publishedAt));
  } else if (mode === 'Top posts') {
    copy.sort((left, right) => (right.reach ?? -1) - (left.reach ?? -1));
  } else {
    copy.sort((left, right) => (right.engagementRate ?? -1) - (left.engagementRate ?? -1));
  }
  return copy;
}

function time(iso: string | null): number {
  if (!iso) {
    return 0;
  }
  const value = new Date(iso).getTime();
  return Number.isNaN(value) ? 0 : value;
}

const styles = StyleSheet.create({
  top: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm + 2,
  },
});
