import { Eye, Heart, ImageOff, MessageCircle, Percent, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { ContentPerformance } from '@/types/analytics';
import { sourceLabels } from '@/types/provenance';
import { formatShortDate } from '@/utils/format-date';

type ContentPerformanceCardProps = {
  post: ContentPerformance;
};

type Fact = { key: string; Icon: LucideIcon; value: string; label: string };

/** One post in the content list. Only fields the source supplied are shown. */
export function ContentPerformanceCard({ post }: ContentPerformanceCardProps) {
  const published = formatShortDate(post.publishedAt);
  const number = new Intl.NumberFormat('en-US');
  const facts: Fact[] = [];
  if (post.likes !== null) {
    facts.push({
      key: 'likes',
      Icon: Heart,
      value: number.format(post.likes),
      label: post.likes === 1 ? 'like' : 'likes',
    });
  }
  if (post.comments !== null) {
    facts.push({
      key: 'comments',
      Icon: MessageCircle,
      value: number.format(post.comments),
      label: post.comments === 1 ? 'comment' : 'comments',
    });
  }
  if (post.reach !== null) {
    facts.push({ key: 'reach', Icon: Eye, value: number.format(post.reach), label: 'reach' });
  }
  if (post.engagementRate !== null) {
    facts.push({
      key: 'rate',
      Icon: Percent,
      value: `${post.engagementRate}%`,
      label: 'engagement',
    });
  }

  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        <ImageOff color={colors.textMuted} size={20} strokeWidth={1.75} />
      </View>
      <View style={styles.copy}>
        <Typography variant="bodySmall" numberOfLines={2}>
          {post.caption ?? 'No caption was supplied.'}
        </Typography>
        <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
          {published ?? 'No date supplied'}
          {post.source ? ` · ${sourceLabels[post.source]}` : ''}
        </Typography>
        {facts.length > 0 ? (
          <View style={styles.facts}>
            {facts.map(({ key, Icon, value, label }) => (
              <View key={key} style={styles.fact} accessibilityLabel={`${value} ${label}`}>
                <Icon color={colors.textSecondary} size={13} strokeWidth={2} />
                <Typography variant="caption" color={colors.textPrimary} strong tabular>
                  {value}
                </Typography>
              </View>
            ))}
          </View>
        ) : (
          <Typography variant="caption" color={colors.textSecondary}>
            No performance fields were supplied.
          </Typography>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: 64,
    height: 80,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: 4,
    marginTop: 2,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
