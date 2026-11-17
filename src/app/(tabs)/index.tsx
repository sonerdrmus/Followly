import { useRouter } from 'expo-router';
import {
  ChartNoAxesCombined,
  FileDown,
  Link2,
  Search,
  Sparkles,
  UserMinus,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react-native';
import { Fragment, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccountMetricCard } from '@/components/dashboard/AccountMetricCard';
import { AIInsightPreview } from '@/components/dashboard/AIInsightPreview';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FollowerActivityCard } from '@/components/dashboard/FollowerActivityCard';
import { GrowthOverview } from '@/components/dashboard/GrowthOverview';
import { InstagramConnectionCard } from '@/components/dashboard/InstagramConnectionCard';
import { InstagramProfileSummary } from '@/components/instagram/InstagramProfileSummary';
import { QuickAccessGrid } from '@/components/dashboard/QuickAccessGrid';
import { TabScreen } from '@/components/navigation/TabScreen';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Divider } from '@/components/ui/Divider';
import type { IconTone } from '@/components/ui/IconWell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Surface } from '@/components/ui/Surface';
import { followerFeatures, type FollowerFeatureId } from '@/content/follower-features';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { accountMetrics, currentProfile, displayMetricValue, growthChart } from '@/data/account';
import { activeInstagramAccount, useInstagramAccounts } from '@/hooks/use-instagram-account';
import { useAuthStore } from '@/stores/auth-store';
import { spacing } from '@/theme';
import type { AccountMetric } from '@/types/account';

const activityIcons: Record<FollowerFeatureId, ReactElement> = {
  'new-followers': <UserPlus />,
  'lost-followers': <UserMinus />,
  'not-following-back': <UserRound />,
  'mutual-followers': <Users />,
};

const activityTones: Record<FollowerFeatureId, IconTone> = {
  'new-followers': 'success',
  'lost-followers': 'danger',
  'not-following-back': 'accent',
  'mutual-followers': 'teal',
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const accounts = useInstagramAccounts();
  const instagram = activeInstagramAccount(accounts.data);
  const connected = instagram?.connectionStatus === 'connected';
  const metrics = accountMetrics.map((metric) => profileMetric(metric, instagram));

  return (
    <TabScreen>
      <DashboardHeader
        profile={currentProfile}
        accountName={user?.displayName ?? 'Followly account'}
        avatarUrl={user?.avatarUrl ?? undefined}
        onProfile={() => {
          router.navigate('/profile');
        }}
      />
      <QuickAccessGrid
        items={[
          {
            id: 'connect',
            label: t('home.connect'),
            description: t('home.connectDetail'),
            icon: <Link2 />,
            featured: !connected,
            onPress: () => router.push('/instagram-connect'),
          },
          {
            id: 'followers',
            label: t('home.followers'),
            description: t('home.followersDetail'),
            icon: <Users />,
            onPress: () => router.navigate('/followers'),
          },
          {
            id: 'analytics',
            label: t('home.analytics'),
            description: t('home.analyticsDetail'),
            icon: <ChartNoAxesCombined />,
            onPress: () => router.navigate('/analytics'),
          },
          {
            id: 'ai',
            label: t('home.ai'),
            description: t('home.aiDetail'),
            icon: <Sparkles />,
            onPress: () => router.navigate('/ai-insights'),
          },
          {
            id: 'search',
            label: t('home.search'),
            description: t('home.searchDetail'),
            icon: <Search />,
            onPress: () => router.push('/profile-search'),
          },
          {
            id: 'snapshots',
            label: t('home.snapshots'),
            description: t('home.snapshotsDetail'),
            icon: <FileDown />,
            onPress: () => router.push({ pathname: '/info', params: { topic: 'snapshots' } }),
          },
        ]}
      />
      {instagram ? (
        <InstagramProfileSummary account={instagram} />
      ) : (
        <InstagramConnectionCard
          onConnect={() => {
            router.push('/instagram-connect');
          }}
        />
      )}
      <View style={styles.section}>
        <SectionHeader
          title={t('home.insights')}
          subtitle={connected ? t('home.insightsConnected') : t('home.insightsEmpty')}
          action={<DataReadinessBadge status={connected ? 'LIMITED_ACCESS' : 'NOT_CONNECTED'} />}
        />
        <Surface padding={0}>
          {metrics.map((metric, index) => (
            <Fragment key={metric.id}>
              {index > 0 ? <Divider inset /> : null}
              <AccountMetricCard
                label={t(metricLabel(metric.id))}
                value={displayMetricValue(metric)}
                hint={hintText(t, metric.hint)}
                status={metric.readiness}
                onPress={() => router.navigate('/analytics')}
              />
            </Fragment>
          ))}
        </Surface>
      </View>
      <GrowthOverview series={growthChart.series} readiness={growthChart.readiness} />
      <View style={styles.section}>
        <SectionHeader
          title={t('home.activity')}
          subtitle={t('home.activityDetail')}
          link={{
            label: t('home.seeAll'),
            onPress: () => router.navigate('/followers'),
            testID: 'see-all-followers',
          }}
        />
        <Surface padding={0}>
          {followerFeatures.map((feature, index) => (
            <Fragment key={feature.id}>
              {index > 0 ? <Divider inset={72} /> : null}
              <FollowerActivityCard
                icon={activityIcons[feature.id]}
                tone={activityTones[feature.id]}
                title={t(`followers.feature.${feature.id}.title` as MessageKey)}
                description={t(`followers.feature.${feature.id}.body` as MessageKey)}
                status={feature.readiness}
                onPress={() => {
                  router.navigate('/followers');
                }}
              />
            </Fragment>
          ))}
        </Surface>
      </View>
      <AIInsightPreview
        onExplore={() => {
          router.navigate('/ai-insights');
        }}
      />
    </TabScreen>
  );
}

function hintText(t: (key: MessageKey) => string, hint: string): string {
  const known: Record<string, MessageKey> = {
    'Connect account': 'home.metricConnect',
    'Awaiting data': 'home.metricAwaiting',
    'Connected profile': 'home.metricProfile',
    'Unavailable from Instagram': 'home.metricMissing',
    'Insights are not synced': 'home.metricInsights',
  };
  const key = known[hint];
  return key ? t(key) : hint;
}

function metricLabel(id: AccountMetric['id']): MessageKey {
  if (id === 'followers') {
    return 'home.metricFollowers';
  }
  if (id === 'following') {
    return 'home.metricFollowing';
  }
  return 'home.metricEngagement';
}

function profileMetric(
  metric: AccountMetric,
  account: ReturnType<typeof activeInstagramAccount>,
): AccountMetric {
  if (!account || account.connectionStatus !== 'connected') {
    return metric;
  }
  if (metric.id === 'followers') {
    return countMetric(metric, account.followersCount, 'Connected profile');
  }
  if (metric.id === 'following') {
    return countMetric(metric, account.followsCount, 'Connected profile');
  }
  return {
    ...metric,
    hint: 'Insights are not synced',
    readiness: 'UNAVAILABLE',
  };
}

function countMetric(metric: AccountMetric, value: number | null, hint: string): AccountMetric {
  if (value === null) {
    return {
      ...metric,
      value: null,
      hint: 'Unavailable from Instagram',
      readiness: 'LIMITED_ACCESS',
    };
  }
  return { ...metric, value, hint, readiness: 'READY' };
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm + 2,
  },
});
