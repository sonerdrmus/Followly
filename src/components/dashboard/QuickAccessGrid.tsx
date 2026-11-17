import { cloneElement, type ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { GradientRing } from '@/components/ui/GradientRing';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

export type QuickAccessItem = {
  id: string;
  label: string;
  description: string;
  icon: ReactElement;
  onPress: () => void;
  /** Draws the sunrise ring: this is the thing waiting for you. */
  featured?: boolean;
};

type QuickAccessGridProps = {
  items: readonly QuickAccessItem[];
};

/**
 * Shortcuts set as story highlights: a row of circles you can reach with a
 * thumb, the one that needs attention ringed in the sunrise gradient.
 */
export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroller}
    >
      {items.map((item) => (
        <Touchable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}. ${item.description}`}
          onPress={item.onPress}
          testID={`shortcut-${item.id}`}
          style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
        >
          <GradientRing size={68} tone={item.featured ? 'story' : 'seen'} thickness={2} gap={3}>
            <View style={styles.core}>
              {cloneElement(item.icon as ReactElement<IconProps>, {
                color: colors.textPrimary,
                size: 24,
                strokeWidth: 1.75,
              })}
            </View>
          </GradientRing>
          <Typography variant="caption" color={colors.textPrimary} numberOfLines={1}>
            {item.label}
          </Typography>
        </Touchable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cell: {
    width: 72,
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.55,
  },
  core: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
