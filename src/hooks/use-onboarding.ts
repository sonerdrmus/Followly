import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { readOnboardingCompleted, writeOnboardingCompleted } from '@/lib/onboarding-preference';

type OnboardingSnapshot = {
  ready: boolean;
  completed: boolean;
};

const serverSnapshot: OnboardingSnapshot = { ready: false, completed: false };
let snapshot: OnboardingSnapshot = serverSnapshot;
const listeners = new Set<() => void>();
let started = false;

function publish(next: OnboardingSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function ensureLoaded() {
  if (started) {
    return;
  }
  started = true;
  readOnboardingCompleted()
    .then((completed) => publish({ ready: true, completed }))
    .catch(() => publish({ ready: true, completed: false }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOnboarding() {
  useEffect(() => {
    ensureLoaded();
  }, []);

  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );

  const complete = useCallback(async () => {
    await writeOnboardingCompleted();
    publish({ ready: true, completed: true });
  }, []);

  return { ...state, complete };
}
