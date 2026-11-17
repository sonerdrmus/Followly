import { ScrollView, StyleSheet } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  label?: (option: T) => string;
};

/** Instagram Insights filter chips: grey pills, the selected one inverted. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  label,
}: SegmentedControlProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={styles.track}
      style={styles.scroller}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Touchable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            hitSlop={{ top: 6, bottom: 6 }}
            style={({ pressed }) => [
              styles.option,
              selected ? styles.selected : null,
              pressed && !selected ? styles.pressed : null,
            ]}
          >
            <Typography
              variant="label"
              color={selected ? colors.textInverse : colors.textPrimary}
              strong
            >
              {label ? label(option) : option}
            </Typography>
          </Touchable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    minHeight: 34,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  selected: {
    backgroundColor: colors.textPrimary,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
});
