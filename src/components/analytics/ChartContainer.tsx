import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';

type ChartContainerProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function ChartContainer({ title, description, children }: ChartContainerProps) {
  return (
    <Surface style={styles.card}>
      <View style={styles.header}>
        <Typography variant="h3">{title}</Typography>
        {description ? <Typography variant="caption">{description}</Typography> : null}
      </View>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
});
