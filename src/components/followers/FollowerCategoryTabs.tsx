import { ScrollView, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import { relationshipTypes, type RelationshipType } from '@/types/follower';
import { Touchable } from '@/components/ui/Touchable';

type FollowerCategoryTabsProps = {
  value: RelationshipType;
  counts: Partial<Record<RelationshipType, number>> | null;
  onChange: (value: RelationshipType) => void;
};

/** Instagram's followers/following tabs: plain text, a white bar under the active one. */
export function FollowerCategoryTabs({ value, counts, onChange }: FollowerCategoryTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.frame}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        contentContainerStyle={styles.row}
      >
        {relationshipTypes.map((type) => {
          const selected = type === value;
          const count = counts?.[type];
          const label = t(`followers.category.${type}.label` as MessageKey);
          return (
            <Touchable
              key={type}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
              onPress={() => onChange(type)}
              testID={`category-${type}`}
              style={({ pressed }) => [styles.tab, pressed ? styles.pressed : null]}
            >
              <View style={styles.labelRow}>
                {count === undefined ? null : (
                  <Typography
                    variant="bodySmall"
                    color={selected ? colors.textPrimary : colors.textSecondary}
                    strong
                    tabular
                  >
                    {count}
                  </Typography>
                )}
                <Typography
                  variant="bodySmall"
                  color={selected ? colors.textPrimary : colors.textSecondary}
                  strong={selected}
                >
                  {label}
                </Typography>
              </View>
              <View style={[styles.indicator, selected ? styles.indicatorOn : null]} />
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  row: {
    gap: spacing.lg,
  },
  tab: {
    minHeight: 46,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: spacing.sm + 2,
  },
  indicator: {
    height: 1.5,
    backgroundColor: 'transparent',
  },
  indicatorOn: {
    backgroundColor: colors.textPrimary,
  },
});
