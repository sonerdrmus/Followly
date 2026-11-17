import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/theme';

type StatChangeProps = {
  value: number;
  precision?: number;
  suffix?: string;
};

export function StatChange({ value, precision = 1, suffix = '%' }: StatChangeProps) {
  const tone = value > 0 ? colors.success : value < 0 ? colors.danger : colors.textMuted;
  const Glyph = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const sign = value > 0 ? '+' : '';

  return (
    <View
      style={styles.row}
      accessibilityLabel={`Change ${sign}${value.toFixed(precision)}${suffix}`}
    >
      <Glyph color={tone} size={14} strokeWidth={2.4} />
      <Typography variant="caption" color={tone} strong tabular>
        {sign}
        {value.toFixed(precision)}
        {suffix}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
