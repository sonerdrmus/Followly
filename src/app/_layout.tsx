import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandSplash } from '@/components/launch/BrandSplash';
import { AuthGate } from '@/components/navigation/AuthGate';
import { FontStatusContext } from '@/hooks/font-status';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useOnboarding } from '@/hooks/use-onboarding';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function RootLayout() {
  const fonts = useAppFonts();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  if (!fonts.ready) {
    return null;
  }

  return (
    <FontStatusContext.Provider value={{ loaded: fonts.loaded }}>
      <GestureHandlerRootView style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <AppShell />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </FontStatusContext.Provider>
  );
}

function AppShell() {
  const onboarding = useOnboarding();
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const localeReady = useLocaleStore((state) => state.ready);
  const hydrateLocale = useLocaleStore((state) => state.hydrate);
  const [splashDone, setSplashDone] = useState(false);
  const gateReady = onboarding.ready && status !== 'initializing' && localeReady;

  useEffect(() => {
    void initialize();
    void hydrateLocale();
  }, [hydrateLocale, initialize]);

  useEffect(() => {
    if (gateReady) {
      void SplashScreen.hideAsync();
    }
  }, [gateReady]);

  return (
    <BottomSheetModalProvider>
      <ThemeProvider value={navigationTheme}>
        <View style={styles.shell}>
          <StatusBar style="light" />
          {gateReady && status !== 'error' ? (
            <>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'none',
                }}
              >
                <Stack.Screen name="info" options={{ animation: 'default' }} />
                <Stack.Screen name="connect-account" options={{ animation: 'default' }} />
                <Stack.Screen name="instagram-connect" options={{ animation: 'default' }} />
                <Stack.Screen name="ai-chat" options={{ animation: 'default' }} />
                <Stack.Screen name="profile-search" options={{ animation: 'default' }} />
              </Stack>
              <AuthGate />
            </>
          ) : null}
          {gateReady && status === 'error' ? <AuthGate /> : null}
          {splashDone && gateReady ? null : (
            <BrandSplash hold={!gateReady} onFinish={() => setSplashDone(true)} />
          )}
        </View>
      </ThemeProvider>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
  },
});
