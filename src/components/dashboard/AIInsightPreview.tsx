import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GradientRing } from '@/components/ui/GradientRing';
import { TonalCard } from '@/components/ui/TonalCard';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

type AIInsightPreviewProps = {
  onExplore: () => void;
};

export function AIInsightPreview({ onExplore }: AIInsightPreviewProps) {
  const { t } = useTranslation();

  return (
    <TonalCard tone="insight">
      <View style={styles.heading}>
        <GradientRing size={48} thickness={2} gap={3} gapColor="#1A0F18">
          <View style={styles.core}>
            <Sparkles color={colors.textPrimary} size={20} strokeWidth={1.8} />
          </View>
        </GradientRing>
        <View style={styles.copy}>
          <Typography variant="label" color="#FF9CC6">
            {t('tabs.ai')}
          </Typography>
          <Typography variant="h2">{t('onboarding.insight.title')}</Typography>
        </View>
      </View>
      <Typography variant="bodySmall" color={colors.textSecondary}>
        {t('onboarding.insight.body')}
      </Typography>
      <Button
        label={t('home.openAi')}
        variant="secondary"
        fullWidth
        onPress={onExplore}
        testID="explore-ai"
      />
    </TonalCard>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  core: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
