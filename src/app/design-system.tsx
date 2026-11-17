import { ArrowUpRight, Bell, Inbox, Plus, Sparkles } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaChart } from '@/components/analytics/AreaChart';
import { ChartContainer } from '@/components/analytics/ChartContainer';
import { ChartLegend } from '@/components/analytics/ChartLegend';
import { LineChart } from '@/components/analytics/LineChart';
import { MetricSelector } from '@/components/analytics/MetricSelector';
import { StatCard } from '@/components/analytics/StatCard';
import { StatChange } from '@/components/analytics/StatChange';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { EmptyState } from '@/components/ui/EmptyState';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { colors, motion, radius, spacing } from '@/theme';
import type { ChartPoint } from '@/types/chart';

const previewSeries: readonly ChartPoint[] = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 21 },
  { label: 'Thu', value: 32 },
  { label: 'Fri', value: 29 },
  { label: 'Sat', value: 36 },
];

const previewReach: readonly ChartPoint[] = [
  { label: 'W1', value: 40 },
  { label: 'W2', value: 46 },
  { label: 'W3', value: 43 },
  { label: 'W4', value: 58 },
];

const swatches = [
  ['Background', colors.background],
  ['Surface', colors.surface],
  ['Raised', colors.surfaceRaised],
  ['Elevated', colors.surfaceElevated],
  ['Primary', colors.primary],
  ['Gold', colors.violet],
  ['Second', colors.accent],
  ['Teal', colors.teal],
  ['Success', colors.success],
  ['Danger', colors.danger],
  ['Warning', colors.warning],
] as const;

export default function DesignSystemScreen() {
  const reducedMotion = useReducedMotion();
  const entering = reducedMotion ? undefined : FadeIn.duration(motion.duration.base);
  const [metric, setMetric] = useState('Reach');
  const [range, setRange] = useState('30D');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={entering} style={styles.intro}>
            <Typography variant="label">Design system</Typography>
            <Typography variant="display">Followly</Typography>
            <Typography variant="body">
              Preview samples on this screen are not account data.
            </Typography>
          </Animated.View>

          <Section title="Color">
            <View style={styles.swatches}>
              {swatches.map(([name, color]) => (
                <View key={name} style={styles.swatch}>
                  <View style={[styles.chip, { backgroundColor: color }]} />
                  <Typography variant="caption">{name}</Typography>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Typography">
            <Typography variant="display">Display 40</Typography>
            <Typography variant="h1">Heading one</Typography>
            <Typography variant="h2">Heading two</Typography>
            <Typography variant="h3">Heading three</Typography>
            <Typography variant="body">Body copy for explanations and longer notes.</Typography>
            <Typography variant="bodySmall">Small body for supporting detail.</Typography>
            <Typography variant="label">Label</Typography>
            <Typography variant="caption">Caption</Typography>
            <Typography variant="stat">128.4</Typography>
          </Section>

          <Section title="Buttons">
            <Button label="Primary" leading={<Plus />} />
            <Button label="Secondary" variant="secondary" trailing={<ArrowUpRight />} />
            <Button label="Outline" variant="outline" />
            <Button label="Ghost" variant="ghost" />
            <Button label="Destructive" variant="destructive" />
            <Button label="Loading" loading />
            <Button label="Disabled" disabled />
            <View style={styles.iconRow}>
              <IconButton icon={<Bell />} accessibilityLabel="Notifications" />
              <IconButton icon={<Plus />} accessibilityLabel="Add" variant="outline" />
              <IconButton icon={<Sparkles />} accessibilityLabel="Insight" variant="ghost" />
            </View>
          </Section>

          <Section title="Surfaces">
            <Surface>
              <Typography variant="h3">Standard surface</Typography>
              <Typography variant="bodySmall">
                Quiet fill, hairline border, room to breathe.
              </Typography>
            </Surface>
            <Surface variant="elevated">
              <Typography variant="h3">Elevated surface</Typography>
              <Typography variant="bodySmall">
                A deeper lift for numbers that should lead.
              </Typography>
            </Surface>
            <Surface variant="outlined">
              <Typography variant="h3">Outlined surface</Typography>
              <Typography variant="bodySmall">Border only, for secondary groupings.</Typography>
            </Surface>
            <GradientSurface variant="ambient">
              <Typography variant="label">Ambient</Typography>
              <Typography variant="h2">Soft light, not a neon wash.</Typography>
            </GradientSurface>
            <GradientSurface>
              <Typography variant="label" color={colors.background}>
                Brand
              </Typography>
              <Typography variant="h2" color={colors.background}>
                One accent gradient.
              </Typography>
            </GradientSurface>
          </Section>

          <Section title="Profile">
            <Surface>
              <ProfileHeader name="Avery Cole" handle="@avery" badge="Creator" premium online />
            </Surface>
            <View style={styles.avatarRow}>
              <Avatar name="Avery Cole" size="sm" />
              <Avatar name="Avery Cole" online />
              <Avatar name="Avery Cole" size="lg" ring />
              <Avatar name="Avery Cole" size="xl" />
            </View>
          </Section>

          <Section title="Badges">
            <View style={styles.badgeRow}>
              <Badge label="Growing" variant="success" />
              <Badge label="Drop" variant="danger" />
              <Badge label="Neutral" />
              <Badge label="Premium" variant="premium" />
              <Badge label="Insight" variant="insight" />
            </View>
          </Section>

          <Section title="Progress">
            <Typography variant="caption">Preview values, passed in as props.</Typography>
            <ProgressBar value={64} label="Preview progress 64" />
            <ProgressBar value={28} label="Preview progress 28" />
            <View style={styles.progressRow}>
              <CircularProgress value={72} label="Preview ring 72" />
              <CircularProgress value={28} size={72} label="Preview ring 28" />
            </View>
          </Section>

          <Section title="Analytics visuals">
            <Typography variant="caption">Preview sample. Not connected to an account.</Typography>
            <View style={styles.statRow}>
              <StatCard label="Reach" value="24.8k" change={4.2} />
              <StatCard label="Saves" value="860" change={-1.4} />
            </View>
            <StatChange value={0} />
            <MetricSelector
              options={['Reach', 'Saves', 'Shares']}
              value={metric}
              onChange={setMetric}
            />
            <TimeRangeSelector options={['7D', '30D', '90D']} value={range} onChange={setRange} />
            <ChartContainer title="Reach" description={`${metric} · ${range} · preview sample`}>
              <LineChart data={previewSeries} />
              <ChartLegend items={[{ label: 'Reach', color: colors.primary }]} />
            </ChartContainer>
            <ChartContainer title="Saves" description="Preview sample">
              <AreaChart data={previewReach} />
              <ChartLegend
                items={[
                  { label: 'Saves', color: colors.violet },
                  { label: 'Shares', color: colors.teal },
                ]}
              />
            </ChartContainer>
          </Section>

          <Section title="Loading and empty">
            <Surface>
              <View style={styles.skeleton}>
                <Skeleton width={120} height={14} />
                <Skeleton height={28} />
                <Skeleton width="70%" height={14} />
              </View>
            </Surface>
            <Surface variant="outlined">
              <EmptyState
                icon={<Inbox />}
                title="No snapshots yet"
                description="A comparison appears after an export or an official account sync."
                action={
                  <Button
                    label="Open sheet"
                    variant="secondary"
                    onPress={() => setSheetOpen(true)}
                  />
                }
              />
            </Surface>
          </Section>
        </ScrollView>
      </SafeAreaView>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Sheet">
        <Typography variant="bodySmall">
          A native sheet for filters and actions. This copy is a preview, not a product flow.
        </Typography>
        <Button label="Close" onPress={() => setSheetOpen(false)} />
      </BottomSheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },
  intro: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatch: {
    width: 72,
    gap: spacing.xs,
  },
  chip: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeleton: {
    gap: spacing.sm,
  },
});
