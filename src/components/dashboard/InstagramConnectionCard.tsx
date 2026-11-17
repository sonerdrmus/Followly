import { Link2, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GradientRing } from '@/components/ui/GradientRing';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

type InstagramConnectionCardProps = {
  onConnect: () => void;
};

export function InstagramConnectionCard({ onConnect }: InstagramConnectionCardProps) {
  const { t } = useTranslation();

  return (
    <Surface style={styles.card}>
      <View style={styles.heading}>
        <GradientRing size={52} thickness={2} gap={3} gapColor={colors.surface}>
          <View style={styles.core}>
            <Link2 color={colors.textPrimary} size={22} strokeWidth={1.9} />
          </View>
        </GradientRing>
        <View style={styles.copy}>
          <Typography variant="title">{t('home.connectTitle')}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('home.connectBody')}
          </Typography>
        </View>
      </View>
      <Button
        label={t('common.connectAccount')}
        fullWidth
        onPress={onConnect}
        testID="connect-account"
      />
      <View style={styles.note}>
        <ShieldCheck color={colors.textMuted} size={14} strokeWidth={2} />
        <Typography variant="caption" color={colors.textMuted}>
          {t('home.connectNote')}
        </Typography>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
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
    backgroundColor: colors.surfaceRaised,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
});
