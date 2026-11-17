import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { InstagramAccount } from '@/types/instagram';

import { InstagramConnectionStatus } from './InstagramConnectionStatus';

type InstagramAccountCardProps = {
  account: InstagramAccount;
};

export function InstagramAccountCard({ account }: InstagramAccountCardProps) {
  const { t } = useTranslation();
  const name = account.displayName ?? account.username;

  return (
    <View style={styles.row}>
      <Avatar name={name} source={account.profilePictureUrl ?? undefined} size="lg" ring="story" />
      <View style={styles.copy}>
        <Typography variant="title">@{account.username}</Typography>
        <Typography variant="bodySmall" color={colors.textSecondary}>
          {account.displayName ?? t('instagram.displayUnavailable')}
        </Typography>
        <InstagramConnectionStatus status={account.connectionStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
