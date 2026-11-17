import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import type { Locale } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

const options: readonly { locale: Locale; label: 'language.english' | 'language.turkish' }[] = [
  { locale: 'en', label: 'language.english' },
  { locale: 'tr', label: 'language.turkish' },
];

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Typography variant="label" color={colors.textSecondary}>
        {t('language.title')}
      </Typography>
      <View style={styles.row} accessibilityRole="tablist">
        {options.map((option) => {
          const selected = option.locale === locale;
          return (
            <Touchable
              key={option.locale}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={t(option.label)}
              onPress={() => {
                void setLocale(option.locale);
              }}
              style={[styles.option, selected ? styles.selected : null]}
            >
              <Typography
                variant="bodySmall"
                color={selected ? '#FFFFFF' : colors.textPrimary}
                strong
              >
                {t(option.label)}
              </Typography>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
  selected: {
    backgroundColor: colors.primary,
  },
});
