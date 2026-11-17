import { Send, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { DetailScaffold } from '@/components/navigation/DetailScaffold';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { GradientRing } from '@/components/ui/GradientRing';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';

/** The direct-message thread with Followly AI. Empty until an account exists. */
export default function AIChatScreen() {
  const { t } = useTranslation();

  return (
    <DetailScaffold
      title={t('ai.title')}
      centered
      footer={
        <View style={styles.composer} accessible accessibilityLabel={t('ai.chatField')}>
          <Typography variant="body" color={colors.textMuted} style={styles.composerText}>
            {t('ai.chatWait')}
          </Typography>
          <View style={styles.send}>
            <Send color={colors.textMuted} size={16} strokeWidth={2.2} />
          </View>
        </View>
      }
    >
      <View style={styles.thread}>
        <GradientRing size={96} thickness={3} gap={4}>
          <View style={styles.core}>
            <Sparkles color={colors.textPrimary} size={34} strokeWidth={1.5} />
          </View>
        </GradientRing>
        <Typography variant="h2" style={styles.center}>
          {t('ai.title')}
        </Typography>
        <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
          {t('ai.chatBody')}
        </Typography>
        <DataReadinessBadge status="NOT_CONNECTED" center />
        <Typography variant="caption" color={colors.textMuted} style={styles.center}>
          {t('ai.noThread')}
        </Typography>
      </View>
    </DetailScaffold>
  );
}

const styles = StyleSheet.create({
  thread: {
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  core: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  center: {
    textAlign: 'center',
    maxWidth: 360,
  },
  composer: {
    width: '100%',
    maxWidth: 568,
    alignSelf: 'center',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    opacity: 0.7,
  },
  composerText: {
    flex: 1,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
