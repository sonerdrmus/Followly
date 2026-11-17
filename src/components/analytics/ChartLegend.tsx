import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { radius, spacing } from '@/theme';

type LegendItem = {
  label: string;
  color: string;
};

type ChartLegendProps = {
  items: readonly LegendItem[];
};

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Typography variant="caption">{item.label}</Typography>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
