import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, fontFamily, spacing } from '@/theme';
import type { DataReadiness } from '@/types/readiness';
import { Touchable } from '@/components/ui/Touchable';

type AccountMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  status: DataReadiness;
  /** Kept for API compatibility; rows are neutral. */
  accent?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** One row of the dashboard's Insights list: name and status left, figure right. */
export function AccountMetricCard({
  label,
  value,
  hint,
  status,
  onPress,
  style,
}: AccountMetricCardProps) {
  const { t } = useTranslation();
  const empty = value === '—';
  const body = (
    <>
      <View style={styles.copy}>
        <Typography variant="body">{label}</Typography>
        <View style={styles.meta}>
          <DataReadinessBadge status={status} quiet />
          <Typography variant="caption" color={colors.textMuted}>
            {hint}
          </Typography>
        </View>
      </View>
      <Typography
        variant="h2"
        color={empty ? colors.textMuted : colors.textPrimary}
        style={styles.value}
        maxFontSizeMultiplier={1.3}
      >
        {value}
      </Typography>
      {onPress ? <ChevronRight color={colors.textMuted} size={18} strokeWidth={2} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={`${label}, ${value}. ${hint}. Status ${status}.`}
        style={[styles.row, style]}
      >
        {body}
      </View>
    );
  }

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}. ${hint}. ${t('home.openAnalytics')}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null, style]}
    >
      {body}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
  },
  value: {
    fontFamily: fontFamily.display,
  },
});
