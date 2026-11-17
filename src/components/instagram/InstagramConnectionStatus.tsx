import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import type { InstagramConnectionState } from '@/types/instagram';

const copy: Record<
  InstagramConnectionState,
  { label: MessageKey; color: string; background: string }
> = {
  connected: {
    label: 'instagram.statusConnected',
    color: colors.success,
    background: colors.successSoft,
  },
  disconnected: {
    label: 'instagram.statusDisconnected',
    color: colors.textSecondary,
    background: colors.surfaceRaised,
  },
  expired: {
    label: 'instagram.statusExpired',
    color: colors.warning,
    background: colors.warningSoft,
  },
  revoked: {
    label: 'instagram.statusRevoked',
    color: colors.danger,
    background: colors.dangerSoft,
  },
};

type InstagramConnectionStatusProps = {
  status: InstagramConnectionState;
};

export function InstagramConnectionStatus({ status }: InstagramConnectionStatusProps) {
  const { t } = useTranslation();
  const tone = copy[status];

  return (
    <View style={[styles.pill, { backgroundColor: tone.background }]} accessibilityRole="text">
      <Typography variant="label" color={tone.color}>
        {t(tone.label)}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
