import { ChevronRight } from 'lucide-react-native';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { IconWell, type IconTone } from '@/components/ui/IconWell';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import type { DataReadiness } from '@/types/readiness';
import { Touchable } from '@/components/ui/Touchable';

type FollowerActivityCardProps = {
  icon: ReactElement;
  title: string;
  description: string;
  status: DataReadiness;
  tone?: IconTone;
  onPress?: () => void;
};

/** A row in the dashboard's follower activity list. */
export function FollowerActivityCard({
  icon: glyph,
  title,
  description,
  status,
  tone = 'primary',
  onPress,
}: FollowerActivityCardProps) {
  const body = (
    <>
      <IconWell icon={glyph} tone={tone} />
      <View style={styles.copy}>
        <Typography variant="body" strong>
          {title}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
          {description}
        </Typography>
        <DataReadinessBadge status={status} quiet />
      </View>
      {onPress ? <ChevronRight color={colors.textMuted} size={18} strokeWidth={2} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{body}</View>;
  }

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      {body}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.pressed,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
});
