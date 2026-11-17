import { FlaskConical } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';

type SampleDataControlsProps = {
  enabled: boolean;
  errorPreview: boolean;
  onToggleSample: () => void;
  onToggleError: () => void;
};

/**
 * Testing switches. Kept on a dashed panel so nobody reads sample numbers as
 * their own account.
 */
export function SampleDataControls({
  enabled,
  errorPreview,
  onToggleSample,
  onToggleError,
}: SampleDataControlsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.panel}>
      <View style={styles.heading}>
        <FlaskConical color={colors.warning} size={15} strokeWidth={2} />
        <Typography variant="label" color={colors.textPrimary}>
          {t('sample.title')}
        </Typography>
      </View>
      <Typography variant="caption" color={colors.textSecondary}>
        {t('sample.body')}
      </Typography>
      <View style={styles.actions}>
        <Button
          label={enabled ? t('sample.hide') : t('sample.show')}
          variant={enabled ? 'primary' : 'secondary'}
          size="sm"
          onPress={onToggleSample}
          testID="show-sample-data"
        />
        <Button
          label={errorPreview ? t('sample.clearError') : t('sample.previewError')}
          variant="outline"
          size="sm"
          onPress={onToggleError}
          testID="preview-error"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
