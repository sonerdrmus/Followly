import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';

import { ProfileAvatar } from './ProfileAvatar';
import { ProfileBadge } from './ProfileBadge';

type ProfileHeaderProps = {
  name: string;
  handle: string;
  badge: string;
  premium?: boolean;
  source?: string;
  online?: boolean;
};

export function ProfileHeader({
  name,
  handle,
  badge,
  premium = false,
  source,
  online,
}: ProfileHeaderProps) {
  return (
    <View style={styles.row}>
      <ProfileAvatar name={name} source={source} online={online} />
      <View style={styles.copy}>
        <Typography variant="h3">{name}</Typography>
        <Typography variant="bodySmall">{handle}</Typography>
        <ProfileBadge label={badge} premium={premium} />
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
    alignItems: 'flex-start',
  },
});
