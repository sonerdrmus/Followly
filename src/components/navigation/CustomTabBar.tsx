import { Tabs } from 'expo-router';
import { ChartNoAxesCombined, House, Sparkles, Users, type LucideIcon } from 'lucide-react-native';
import { type ComponentProps, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useTranslation } from '@/i18n/use-translation';
import type { MessageKey } from '@/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { colors, icon, radius, spacing } from '@/theme';
import { Touchable } from '@/components/ui/Touchable';

type CustomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const tabMeta: Record<string, { label: MessageKey; Icon: LucideIcon | null }> = {
  index: { label: 'tabs.home', Icon: House },
  followers: { label: 'tabs.followers', Icon: Users },
  analytics: { label: 'tabs.analytics', Icon: ChartNoAxesCombined },
  'ai-insights': { label: 'tabs.ai', Icon: Sparkles },
  profile: { label: 'tabs.profile', Icon: null },
};

/**
 * Instagram's bottom bar: icons only, hairline on top, the profile tab shown
 * as your avatar. On web and tablets with a keyboard, keys 1 to 5 switch tabs.
 */
export function CustomTabBar({ state, insets, emitter, navigateToTab }: CustomTabBarProps) {
  const { t } = useTranslation();
  const name = useAuthStore((store) => store.user?.displayName ?? 'Followly');
  const avatarUrl = useAuthStore((store) => store.user?.avatarUrl ?? undefined);

  const select = (index: number) => {
    const route = state.routes[index];
    if (!route) {
      return;
    }
    const focused = index === state.index;
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) {
      navigateToTab(route.key);
    }
  };

  const selectRef = useRef(select);
  useEffect(() => {
    selectRef.current = select;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < 5) {
        selectRef.current(index);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <View
      style={[
        styles.dock,
        {
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
    >
      <View accessibilityRole="tablist" style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = tabMeta[route.name] ?? { label: 'tabs.home' as const, Icon: House };
          const label = t(meta.label);
          const focused = index === state.index;
          const Glyph = meta.Icon;

          return (
            <Touchable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              accessibilityHint={
                Platform.OS === 'web' ? t('tabs.shortcut', { n: index + 1 }) : undefined
              }
              testID={`tab-${route.name}`}
              onPress={() => select(index)}
              onLongPress={() => {
                emitter.emit({ type: 'tabLongPress', target: route.key });
              }}
              style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
            >
              {Glyph ? (
                <Glyph
                  color={focused ? colors.textPrimary : colors.textSecondary}
                  size={26}
                  strokeWidth={focused ? icon.strokeActive : icon.stroke}
                />
              ) : (
                <View style={[styles.profile, focused ? styles.profileActive : null]}>
                  <Avatar name={name} source={avatarUrl} size="xs" />
                </View>
              )}
              <View style={[styles.marker, focused ? styles.markerOn : null]} />
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 5,
  },
  pressed: {
    opacity: 0.5,
  },
  profile: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileActive: {
    borderColor: colors.textPrimary,
  },
  marker: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  markerOn: {
    backgroundColor: colors.accent,
  },
});
