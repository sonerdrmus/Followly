import { Redirect, Tabs } from 'expo-router';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { QuickActionsSheet } from '@/components/navigation/QuickActionsSheet';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from '@/i18n/use-translation';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { ready, completed } = useOnboarding();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const signedIn = status === 'authenticated' || (status === 'refreshing' && user !== null);
  const { t } = useTranslation();

  if (!ready || status === 'initializing') {
    return null;
  }

  if (!completed) {
    return <Redirect href="/onboarding" />;
  }

  if (!signedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'none',
          sceneStyle: { backgroundColor: colors.background },
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="followers" options={{ title: t('tabs.followers') }} />
        <Tabs.Screen name="analytics" options={{ title: t('tabs.analytics') }} />
        <Tabs.Screen name="ai-insights" options={{ title: t('tabs.ai') }} />
        <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      </Tabs>
      <QuickActionsSheet />
    </>
  );
}
