import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Typography } from './Typography';
import { Touchable } from './Touchable';

type ListRowProps = {
  title: string;
  detail?: string;
  leading?: ReactNode;
  /** Right-hand value, such as a metric. */
  value?: ReactNode;
  /** Extra content under the detail line. */
  footer?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

/** The workhorse row of an Instagram settings or insights list. */
export function ListRow({
  title,
  detail,
  leading,
  value,
  footer,
  chevron,
  destructive = false,
  onPress,
  accessibilityLabel,
  testID,
}: ListRowProps) {
  const showChevron = chevron ?? Boolean(onPress);

  const body = (
    <>
      {leading}
      <View style={styles.copy}>
        <Typography variant="body" color={destructive ? colors.danger : colors.textPrimary}>
          {title}
        </Typography>
        {detail ? (
          <Typography variant="caption" color={colors.textSecondary}>
            {detail}
          </Typography>
        ) : null}
        {footer}
      </View>
      {value}
      {showChevron ? <ChevronRight color={colors.textMuted} size={18} strokeWidth={2} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.row} testID={testID}>
        {body}
      </View>
    );
  }

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      {body}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
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
    gap: 2,
  },
});
