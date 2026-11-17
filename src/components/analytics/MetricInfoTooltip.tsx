import { Info } from 'lucide-react-native';
import {} from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, icon } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

type MetricInfoButtonProps = {
  metricKey: string;
  onOpen: (metricKey: string) => void;
};

export function MetricInfoButton({ metricKey, onOpen }: MetricInfoButtonProps) {
  const { t } = useTranslation();
  const info = metricCopy(t, metricKey);
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={t('analytics.about', { title: info.title })}
      hitSlop={12}
      onPress={() => onOpen(metricKey)}
      testID={`metric-info-${metricKey}`}
      style={({ pressed }) => (pressed ? { opacity: 0.5 } : null)}
    >
      <Info color={colors.textMuted} size={15} strokeWidth={icon.stroke} />
    </Touchable>
  );
}

type MetricInfoTooltipProps = {
  metricKey: string | null;
  onClose: () => void;
};

export function MetricInfoTooltip({ metricKey, onClose }: MetricInfoTooltipProps) {
  const { t } = useTranslation();
  const info = metricCopy(t, metricKey ?? 'followers');

  return (
    <BottomSheet open={metricKey !== null} onClose={onClose} title={info.title}>
      <Typography variant="body" color={colors.textSecondary}>
        {info.body}
      </Typography>
    </BottomSheet>
  );
}

function metricCopy(t: (key: MessageKey) => string, metricKey: string) {
  const title = `metrics.${metricKey}.title`;
  const body = `metrics.${metricKey}.body`;
  if (knownMetrics.has(title) && knownMetrics.has(body)) {
    return { title: t(title as MessageKey), body: t(body as MessageKey) };
  }
  return { title: t('metrics.fallback.title'), body: t('metrics.fallback.body') };
}

const knownMetrics = new Set<string>([
  'metrics.followers.title',
  'metrics.followers.body',
  'metrics.following.title',
  'metrics.following.body',
  'metrics.engagementRate.title',
  'metrics.engagementRate.body',
  'metrics.reach.title',
  'metrics.reach.body',
  'metrics.impressions.title',
  'metrics.impressions.body',
  'metrics.profileVisits.title',
  'metrics.profileVisits.body',
  'metrics.likes.title',
  'metrics.likes.body',
  'metrics.comments.title',
  'metrics.comments.body',
  'metrics.interactions.title',
  'metrics.interactions.body',
  'metrics.storyViews.title',
  'metrics.storyViews.body',
  'metrics.storyReach.title',
  'metrics.storyReach.body',
  'metrics.storyInteractions.title',
  'metrics.storyInteractions.body',
  'metrics.storyReplies.title',
  'metrics.storyReplies.body',
  'metrics.storyExits.title',
  'metrics.storyExits.body',
]);
