import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { IconWell } from '@/components/ui/IconWell';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import type { DataReadiness } from '@/types/readiness';

import { DataReadinessBadge } from './DataReadinessBadge';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type FeatureEmptyStateProps = {
  icon?: ReactElement;
  title: string;
  description: string;
  status: DataReadiness;
  compact?: boolean;
  action?: ReactNode;
};

export function FeatureEmptyState({
  icon: glyph,
  title,
  description,
  status,
  compact = false,
  action,
}: FeatureEmptyStateProps) {
  if (!compact) {
    return (
      <Surface style={styles.full}>
        <EmptyState
          icon={glyph as ReactElement<IconProps> | undefined}
          title={title}
          description={description}
          action={action}
        />
        <View style={styles.badge}>
          <DataReadinessBadge status={status} />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.compact}>
      <View style={styles.row}>
        {glyph ? <IconWell icon={glyph} tone="neutral" size="sm" /> : null}
        <View style={styles.copy}>
          <Typography variant="title">{title}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {description}
          </Typography>
          <View style={styles.status}>
            <DataReadinessBadge status={status} quiet />
          </View>
        </View>
      </View>
      {action}
    </Surface>
  );
}

const styles = StyleSheet.create({
  full: {
    paddingBottom: spacing.xl,
  },
  badge: {
    alignSelf: 'center',
  },
  compact: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  status: {
    marginTop: 2,
  },
});
