import { StyleSheet, View } from 'react-native';

import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { UserProfile } from '@/types/account';
import { greetingForHour } from '@/utils/greeting';
import { Touchable } from '@/components/ui/Touchable';

type DashboardHeaderProps = {
  profile: UserProfile;
  /** The signed-in Followly account name, used until Instagram is connected. */
  accountName: string;
  avatarUrl?: string;
  onProfile: () => void;
};

/** The account strip at the top of the professional dashboard. */
export function DashboardHeader({
  profile,
  accountName,
  avatarUrl,
  onProfile,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const greeting = t(greetingForHour(new Date().getHours()));
  const connected = profile.connection === 'connected';
  const handle = connected ? (profile.username ?? profile.displayName) : null;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={t('home.openProfile', { greeting, name: accountName })}
      onPress={onProfile}
      testID="header-profile"
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <Avatar
        name={accountName}
        source={avatarUrl ?? profile.avatarUrl ?? undefined}
        size="xl"
        ring={connected ? 'story' : 'seen'}
      />
      <View style={styles.copy}>
        <Typography variant="caption" color={colors.textSecondary}>
          {greeting}
        </Typography>
        <Typography variant="h2" numberOfLines={1}>
          {accountName}
        </Typography>
        {handle ? (
          <Typography variant="bodySmall" color={colors.textSecondary} numberOfLines={1}>
            @{handle}
          </Typography>
        ) : (
          <DataReadinessBadge status="NOT_CONNECTED" quiet />
        )}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.6,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
});
