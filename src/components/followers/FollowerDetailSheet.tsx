import { BadgeCheck, ExternalLink } from 'lucide-react-native';
import { Linking, StyleSheet, View } from 'react-native';

import { DataSourceLabel } from '@/components/analytics/DataSourceLabel';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import type { Follower } from '@/types/follower';
import type { DataProvenance } from '@/types/provenance';
import { formatShortDate } from '@/utils/format-date';
import { isPublicProfileUrl } from '@/utils/follower-query';

import { RelationshipBadge } from './RelationshipBadge';

type FollowerDetailSheetProps = {
  follower: Follower | null;
  provenance: DataProvenance;
  onClose: () => void;
};

export function FollowerDetailSheet({ follower, provenance, onClose }: FollowerDetailSheetProps) {
  const { t } = useTranslation();
  const profileUrl =
    follower && isPublicProfileUrl(follower.profileUrl) ? follower.profileUrl : null;
  const seen = formatShortDate(follower?.lastSeenAt ?? null);
  const followed = formatShortDate(follower?.followedAt ?? null);
  const flags = follower
    ? [
        follower.verified === true ? t('followers.verifiedFlag') : null,
        follower.isPublic === true ? t('followers.publicFlag') : null,
        follower.isPublic === false ? t('followers.privateFlag') : null,
      ].filter((flag): flag is string => flag !== null)
    : [];

  return (
    <BottomSheet
      open={follower !== null}
      onClose={onClose}
      title={t('followers.details')}
      snapPoints={['76%']}
    >
      {follower ? (
        <View style={styles.content}>
          <View style={styles.identity}>
            <Avatar
              name={follower.displayName ?? follower.username}
              source={follower.avatarUrl ?? undefined}
              size="xxl"
              ring={follower.relationshipType === 'new' ? 'story' : 'seen'}
            />
            <View style={styles.nameRow}>
              <Typography variant="h2" style={styles.center} numberOfLines={1}>
                {follower.username}
              </Typography>
              {follower.verified === true ? (
                <BadgeCheck color={colors.primary} size={18} strokeWidth={2.4} />
              ) : null}
            </View>
            <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
              {follower.displayName ?? t('followers.noName')}
            </Typography>
            <View style={styles.badge}>
              <RelationshipBadge type={follower.relationshipType} />
            </View>
          </View>
          <View style={styles.facts}>
            <Typography variant="bodySmall">
              {follower.relationshipType === 'lost'
                ? t('followers.lastSnapshotBody', { date: seen ?? t('followers.dateMissing') })
                : t('followers.followedBody', { date: followed ?? t('followers.dateMissing') })}
            </Typography>
            {flags.length > 0 ? (
              <Typography variant="caption" color={colors.textMuted}>
                {flags.join(' · ')}
              </Typography>
            ) : null}
            <Divider />
            <DataSourceLabel provenance={provenance} />
          </View>
          {profileUrl ? (
            <Button
              label={t('followers.openProfile')}
              variant="secondary"
              fullWidth
              trailing={<ExternalLink />}
              onPress={() => {
                void Linking.openURL(profileUrl);
              }}
            />
          ) : (
            <Typography variant="caption" color={colors.textMuted} style={styles.center}>
              {t('followers.noLink')}
            </Typography>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  badge: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  facts: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
});
