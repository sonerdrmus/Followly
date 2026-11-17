import { Redirect } from 'expo-router';

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuthStore } from '@/stores/auth-store';

export default function OnboardingScreen() {
  const { ready, completed } = useOnboarding();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (!ready || status === 'initializing') {
    return null;
  }

  if (completed) {
    const signedIn = status === 'authenticated' || (status === 'refreshing' && user !== null);
    return <Redirect href={signedIn ? '/' : '/login'} />;
  }

  return <OnboardingFlow />;
}
