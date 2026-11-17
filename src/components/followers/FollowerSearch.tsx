import { Search, X } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useFontStatus } from '@/hooks/font-status';
import { useTranslation } from '@/i18n/use-translation';
import { colors, fontFamily, radius, spacing } from '@/theme';

type FollowerSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
};

export function FollowerSearch({
  value,
  onChange,
  placeholder = 'Search username or name',
  editable = true,
  testID = 'follower-search',
}: FollowerSearchProps) {
  const { t } = useTranslation();
  const hint = placeholder ?? t('followers.searchPlaceholder');
  const { loaded } = useFontStatus();

  return (
    <View style={[styles.field, editable ? null : styles.disabled]}>
      <Search color={colors.textSecondary} size={17} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={hint}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        returnKeyType="search"
        selectionColor={colors.primary}
        accessibilityLabel={hint}
        testID={testID}
        style={[styles.input, loaded ? { fontFamily: fontFamily.body } : null]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('nav.clearSearch')}
          onPress={() => onChange('')}
          hitSlop={10}
          style={styles.clear}
        >
          <X color={colors.background} size={12} strokeWidth={3} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  disabled: {
    opacity: 0.6,
  },
  input: {
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
