import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import type { MessageKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { DataReadiness } from '@/types/readiness';

import { readinessContent } from './readiness';

type DataReadinessBadgeProps = {
  status: DataReadiness;
  showExplanation?: boolean;
  explanation?: string;
  /** Text-only form for dense rows: a coloured dot and the label. */
  quiet?: boolean;
  /** Centre the badge in its column, for centred layouts. */
  center?: boolean;
};

const tones = {
  success: { background: colors.successSoft, text: colors.success },
  insight: { background: colors.primarySoft, text: '#4DB5FF' },
  premium: { background: colors.accentSoft, text: '#FF7EB3' },
  warning: { background: colors.warningSoft, text: colors.warning },
  neutral: { background: colors.surfaceRaised, text: colors.textSecondary },
  danger: { background: colors.dangerSoft, text: colors.danger },
} as const;

export function DataReadinessBadge({
  status,
  showExplanation = false,
  explanation,
  quiet = false,
  center = false,
}: DataReadinessBadgeProps) {
  const { t } = useTranslation();
  const content = readinessContent[status];
  const tone = tones[content.tone];
  const Glyph = content.icon;
  const label = t(`readiness.${status}.label` as MessageKey);
  const detail = explanation ?? t(`readiness.${status}.body` as MessageKey);

  return (
    <View style={[styles.wrap, center ? styles.centered : null]}>
      {quiet ? (
        <View accessibilityRole="text" accessibilityLabel={label} style={styles.quiet}>
          <View style={[styles.dot, { backgroundColor: tone.text }]} />
          <Typography variant="caption" color={tone.text}>
            {label}
          </Typography>
        </View>
      ) : (
        <View
          accessibilityRole="text"
          accessibilityLabel={label}
          style={[styles.pill, { backgroundColor: tone.background }]}
        >
          <Glyph color={tone.text} size={13} strokeWidth={2.25} />
          <Typography variant="caption" color={tone.text} strong>
            {label}
          </Typography>
        </View>
      )}
      {showExplanation ? (
        <Typography variant="caption" color={colors.textSecondary}>
          {detail}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  centered: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  quiet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
});
