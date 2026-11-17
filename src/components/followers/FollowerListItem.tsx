import { BadgeCheck } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import type { Follower } from '@/types/follower';
import { formatShortDate } from '@/utils/format-date';

import { relationshipLabel } from './RelationshipBadge';
import { Touchable } from '@/components/ui/Touchable';

type FollowerListItemProps = {
  follower: Follower;
  onPress: (follower: Follower) => void;
};

function FollowerListItemComponent({ follower, onPress }: FollowerListItemProps) {
  const { t } = useTranslation();
  const name = follower.displayName ?? follower.username;
  const when =
    follower.relationshipType === 'lost'
      ? formatShortDate(follower.lastSeenAt)
      : formatShortDate(follower.followedAt);
  const whenLabel =
    follower.relationshipType === 'lost' ? t('followers.lastSnapshot') : t('followers.date');
  const ring = follower.relationshipType === 'new' ? 'story' : false;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${follower.username}. ${relationshipLabel(t, follower.relationshipType)}. ${t('followers.openDetails')}`}
      onPress={() => onPress(follower)}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <Avatar name={name} source={follower.avatarUrl ?? undefined} size="lg" ring={ring} />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Typography variant="bodySmall" strong numberOfLines={1} style={styles.username}>
            {follower.username}
          </Typography>
          {follower.verified === true ? (
            <BadgeCheck color={colors.primary} size={14} strokeWidth={2.4} />
          ) : null}
        </View>
        <Typography variant="bodySmall" color={colors.textSecondary} numberOfLines={1}>
          {follower.displayName ?? t('followers.noDisplayName')}
        </Typography>
        <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
          {t(`source.${follower.source}` as MessageKey)}
          {when ? ` · ${whenLabel} ${when}` : ''}
        </Typography>
      </View>
      <View style={styles.pill}>
        <Typography variant="caption" strong numberOfLines={1}>
          {relationshipLabel(t, follower.relationshipType)}
        </Typography>
      </View>
    </Touchable>
  );
}

export const FollowerListItem = memo(FollowerListItemComponent);

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    flexShrink: 1,
  },
  pill: {
    maxWidth: 128,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
});
