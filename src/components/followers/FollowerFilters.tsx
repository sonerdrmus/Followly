import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import { followerSorts, type FollowerSort } from '@/types/follower';
import { Touchable } from '@/components/ui/Touchable';

export const sortLabels: Record<FollowerSort, MessageKey> = {
  'username-asc': 'followers.usernameAsc',
  'username-desc': 'followers.usernameDesc',
  newest: 'followers.newest',
  oldest: 'followers.oldest',
};

type FollowerFiltersProps = {
  open: boolean;
  onClose: () => void;
  sort: FollowerSort;
  onSort: (sort: FollowerSort) => void;
  verifiedOnly: boolean;
  namedOnly: boolean;
  onVerifiedOnly: (value: boolean) => void;
  onNamedOnly: (value: boolean) => void;
  dateSortEnabled: boolean;
  verifiedFilterEnabled: boolean;
};

export function FollowerFilters({
  open,
  onClose,
  sort,
  onSort,
  verifiedOnly,
  namedOnly,
  onVerifiedOnly,
  onNamedOnly,
  dateSortEnabled,
  verifiedFilterEnabled,
}: FollowerFiltersProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet open={open} onClose={onClose} title={t('followers.sort')} snapPoints={['74%']}>
      <Typography variant="label" color={colors.textSecondary}>
        {t('followers.sortBy')}
      </Typography>
      <View style={styles.group}>
        {followerSorts.map((option) => {
          const needsDate = option === 'newest' || option === 'oldest';
          const disabled = needsDate && !dateSortEnabled;
          const selected = sort === option;
          return (
            <Touchable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onSort(option)}
              testID={`sort-${option}`}
              style={({ pressed }) => [
                styles.row,
                pressed ? styles.pressed : null,
                disabled ? styles.disabled : null,
              ]}
            >
              <Typography variant="body" color={disabled ? colors.textMuted : colors.textPrimary}>
                {t(sortLabels[option])}
              </Typography>
              <View style={[styles.radio, selected ? styles.radioOn : null]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Touchable>
          );
        })}
      </View>
      {dateSortEnabled ? null : (
        <Typography variant="caption" color={colors.textMuted}>
          {t('followers.dateSortOff')}
        </Typography>
      )}
      <Typography variant="label" color={colors.textSecondary} style={styles.heading}>
        {t('followers.showOnly')}
      </Typography>
      <View style={styles.group}>
        <FilterRow
          label={t('followers.verified')}
          selected={verifiedOnly}
          disabled={!verifiedFilterEnabled}
          onPress={() => onVerifiedOnly(!verifiedOnly)}
          testID="filter-verified"
        />
        <FilterRow
          label={t('followers.named')}
          selected={namedOnly}
          disabled={false}
          onPress={() => onNamedOnly(!namedOnly)}
          testID="filter-named"
        />
      </View>
      {verifiedFilterEnabled ? null : (
        <Typography variant="caption" color={colors.textMuted}>
          {t('followers.verifiedWait')}
        </Typography>
      )}
    </BottomSheet>
  );
}

function FilterRow({
  label,
  selected,
  disabled,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Touchable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Typography variant="body" color={disabled ? colors.textMuted : colors.textPrimary}>
        {label}
      </Typography>
      <View style={[styles.box, selected ? styles.boxOn : null]}>
        {selected ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  group: {
    marginHorizontal: -spacing.lg,
  },
  heading: {
    marginTop: spacing.sm,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.pressed,
  },
  disabled: {
    opacity: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.textPrimary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs + 2,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
