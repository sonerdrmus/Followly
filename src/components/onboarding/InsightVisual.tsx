import { Clock3, Layers, Sparkles, Users } from 'lucide-react-native';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientRing } from '@/components/ui/GradientRing';
import { IconWell, type IconTone } from '@/components/ui/IconWell';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type InsightVisualProps = {
  active: boolean;
};

const ideas: readonly { label: string; icon: ReactElement; tone: IconTone }[] = [
  { label: 'Timing', icon: <Clock3 />, tone: 'accent' },
  { label: 'Format', icon: <Layers />, tone: 'violet' },
  { label: 'Audience', icon: <Users />, tone: 'teal' },
];

/** A still preview of the AI idea. Nothing has been analyzed. */
export function InsightVisual(_props: InsightVisualProps) {
  return (
    <View style={styles.scene}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.stage}
      >
        <GradientRing size={104} thickness={3} gap={4}>
          <View style={styles.core}>
            <Sparkles color={colors.textPrimary} size={36} strokeWidth={1.6} />
          </View>
        </GradientRing>
        <View style={styles.chips}>
          {ideas.map((idea) => (
            <Surface key={idea.label} padding={spacing.sm} style={styles.chip}>
              <IconWell icon={idea.icon} tone={idea.tone} size="sm" />
              <Typography variant="bodySmall" strong>
                {idea.label}
              </Typography>
            </Surface>
          ))}
        </View>
      </View>
      <Typography variant="caption" color={colors.textMuted} style={styles.caption}>
        A preview of the idea. Nothing has been analyzed yet.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    gap: spacing.lg,
  },
  stage: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  core: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: 999,
  },
  caption: {
    textAlign: 'center',
  },
});
