import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTranslation } from '@/i18n/use-translation';
import type { MessageKey } from '@/i18n';
import { colors, motion, radius, spacing } from '@/theme';

import { AudienceVisual } from './AudienceVisual';
import { GrowthVisual } from './GrowthVisual';
import { InsightVisual } from './InsightVisual';
import { Touchable } from '@/components/ui/Touchable';

const lastPage = 2;

const pages = [
  { key: 'growth', Visual: GrowthVisual },
  { key: 'audience', Visual: AudienceVisual },
  { key: 'insight', Visual: InsightVisual },
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complete } = useOnboarding();
  const reducedMotion = Boolean(useReducedMotion());
  const { width, height } = useWindowDimensions();
  const compact = height < 720;
  const [page, setPage] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const lock = useRef(false);
  const offset = useSharedValue(0);

  const release = useCallback(() => {
    lock.current = false;
    setTransitioning(false);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (lock.current || next < 0 || next > lastPage || next === page) {
        return;
      }
      lock.current = true;
      setTransitioning(true);
      setPage(next);
      offset.set(
        withTiming(next, { duration: reducedMotion ? 0 : motion.duration.base }, () => {
          runOnJS(release)();
        }),
      );
    },
    [offset, page, reducedMotion, release],
  );

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value * width }],
  }));

  async function finish() {
    if (lock.current) {
      return;
    }
    lock.current = true;
    setFinishing(true);
    try {
      await complete();
      router.replace('/');
    } catch {
      lock.current = false;
      setFinishing(false);
    }
  }

  const busy = transitioning || finishing;

  return (
    <SafeAreaView style={styles.screen}>
      <StoryProgress page={page} />
      <View style={styles.header}>
        <Typography variant="label" color={colors.textSecondary}>
          {t(`onboarding.${pages[page].key}.eyebrow` as MessageKey)}
        </Typography>
        <Touchable
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.skip')}
          disabled={busy}
          hitSlop={12}
          onPress={() => {
            void finish();
          }}
          style={({ pressed }) => [styles.skip, pressed ? styles.pressed : null]}
        >
          <Typography variant="bodySmall" strong>
            {t('common.skip')}
          </Typography>
        </Touchable>
      </View>
      <View style={styles.viewport}>
        <Animated.View style={[styles.track, { width: width * pages.length }, trackStyle]}>
          {pages.map((item, index) => {
            const Visual = item.Visual;
            return (
              <View
                key={item.key}
                accessibilityElementsHidden={page !== index}
                importantForAccessibility={page === index ? 'auto' : 'no-hide-descendants'}
                style={[styles.page, { width }]}
              >
                <ScrollView
                  style={styles.scroller}
                  contentContainerStyle={[styles.column, compact ? styles.columnCompact : null]}
                  showsVerticalScrollIndicator={false}
                >
                  <Visual active={page === index} />
                  <View accessibilityLiveRegion="polite" style={styles.copy}>
                    <Typography accessibilityRole="header" variant="h1" style={styles.title}>
                      {t(`onboarding.${item.key}.title` as MessageKey)}
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary}>
                      {t(`onboarding.${item.key}.body` as MessageKey)}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      {t(`onboarding.${item.key}.note` as MessageKey)}
                    </Typography>
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </Animated.View>
      </View>
      <View style={styles.footer}>
        {page > 0 ? (
          <Button
            label={t('common.back')}
            variant="secondary"
            shape="pill"
            disabled={busy}
            onPress={() => goTo(page - 1)}
            style={styles.back}
          />
        ) : null}
        <Button
          label={page === lastPage ? t('common.getStarted') : t('common.continue')}
          shape="pill"
          loading={finishing && page === lastPage}
          disabled={busy}
          onPress={() => {
            if (page === lastPage) {
              void finish();
              return;
            }
            goTo(page + 1);
          }}
          style={styles.next}
        />
      </View>
    </SafeAreaView>
  );
}

/** Story-style progress: one segment per screen, filled up to the current one. */
function StoryProgress({ page }: { page: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Screen ${page + 1} of 3`}
      style={styles.progress}
    >
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.segment}>
          <View style={[styles.segmentFill, item <= page ? styles.segmentOn : null]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progress: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 2.5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    overflow: 'hidden',
  },
  segmentFill: {
    flex: 1,
  },
  segmentOn: {
    backgroundColor: colors.textPrimary,
  },
  header: {
    minHeight: 48,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  viewport: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  scroller: {
    flex: 1,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  columnCompact: {
    gap: spacing.lg,
  },
  copy: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 32,
    lineHeight: 37,
  },
  footer: {
    width: '100%',
    maxWidth: 528,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  back: {
    flex: 1,
  },
  next: {
    flex: 2,
  },
});
