import { useRouter } from 'expo-router';
import { Activity, Send, Sparkles, WandSparkles, Waypoints } from 'lucide-react-native';
import { Fragment, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabScreen } from '@/components/navigation/TabScreen';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { FeatureEmptyState } from '@/components/status/FeatureEmptyState';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { GradientRing } from '@/components/ui/GradientRing';
import { IconWell, type IconTone } from '@/components/ui/IconWell';
import { ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

const capabilities: readonly {
  id: 'patterns' | 'content' | 'next';
  icon: ReactElement;
  tone: IconTone;
}[] = [
  { id: 'patterns', icon: <Waypoints />, tone: 'teal' },
  { id: 'content', icon: <WandSparkles />, tone: 'violet' },
  { id: 'next', icon: <Sparkles />, tone: 'accent' },
];

const capabilityCopy: Record<
  (typeof capabilities)[number]['id'],
  { title: MessageKey; body: MessageKey }
> = {
  patterns: { title: 'ai.patterns', body: 'ai.patternsBody' },
  content: { title: 'ai.content', body: 'ai.contentBody' },
  next: { title: 'ai.next', body: 'ai.nextBody' },
};

export default function AIInsightsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TabScreen title={t('ai.title')}>
      <View style={styles.hero}>
        <GradientRing size={104} thickness={3} gap={4}>
          <View style={styles.heroCore}>
            <Sparkles color={colors.textPrimary} size={38} strokeWidth={1.5} />
          </View>
        </GradientRing>
        <View style={styles.heroCopy}>
          <Typography variant="h1" style={styles.center}>
            {t('ai.hero')}
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
            {t('ai.heroBody')}
          </Typography>
        </View>
        <DataReadinessBadge status="NOT_CONNECTED" center />
        <Button
          label={t('common.connectAccount')}
          fullWidth
          onPress={() => {
            router.push('/connect-account');
          }}
        />
      </View>

      <Touchable
        accessibilityRole="button"
        accessibilityLabel={t('ai.open')}
        onPress={() => router.push('/ai-chat')}
        testID="open-ai-chat"
        style={({ pressed }) => [styles.composer, pressed ? styles.pressed : null]}
      >
        <Typography variant="body" color={colors.textSecondary} style={styles.composerText}>
          {t('ai.composer')}
        </Typography>
        <View style={styles.send}>
          <Send color="#FFFFFF" size={16} strokeWidth={2.2} />
        </View>
      </Touchable>

      <View style={styles.section}>
        <SectionHeader title={t('ai.willDo')} />
        <Surface padding={0}>
          {capabilities.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? <Divider inset={76} /> : null}
              <ListRow
                title={t(capabilityCopy[item.id].title)}
                detail={t(capabilityCopy[item.id].body)}
                leading={<IconWell icon={item.icon} tone={item.tone} />}
                footer={
                  <View style={styles.rowStatus}>
                    <DataReadinessBadge status="NOT_CONNECTED" quiet />
                  </View>
                }
              />
            </Fragment>
          ))}
        </Surface>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('ai.learning')} />
        <Surface padding={0}>
          <ListRow
            title={t('ai.hero')}
            leading={<IconWell icon={<Activity />} tone="neutral" />}
            footer={
              <View style={styles.rowStatus}>
                <DataReadinessBadge status="NOT_CONNECTED" showExplanation />
              </View>
            }
          />
        </Surface>
      </View>

      <FeatureEmptyState
        icon={<Sparkles />}
        title={t('ai.none')}
        description={t('ai.noneBody')}
        status="NOT_CONNECTED"
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  heroCore: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  heroCopy: {
    gap: spacing.xs + 2,
    maxWidth: 380,
  },
  center: {
    textAlign: 'center',
  },
  composer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  composerText: {
    flex: 1,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  section: {
    gap: spacing.sm + 2,
  },
  rowStatus: {
    marginTop: 4,
  },
});
