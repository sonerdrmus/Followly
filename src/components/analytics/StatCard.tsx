import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';

import { StatChange } from './StatChange';

type StatCardProps = {
  label: string;
  value: string;
  change?: number;
  changeSuffix?: string;
};

export function StatCard({ label, value, change, changeSuffix }: StatCardProps) {
  return (
    <Surface variant="elevated" style={styles.card}>
      <Typography variant="label">{label}</Typography>
      <View style={styles.valueRow}>
        <Typography variant="stat">{value}</Typography>
        {change === undefined ? null : <StatChange value={change} suffix={changeSuffix} />}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    flexGrow: 1,
  },
  valueRow: {
    gap: spacing.xs,
  },
});
