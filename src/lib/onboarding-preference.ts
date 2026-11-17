import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = 'followly.onboarding.completed';

export function readOnboardingCompleted() {
  return AsyncStorage.getItem(storageKey).then((value) => value === 'true');
}

export function writeOnboardingCompleted() {
  return AsyncStorage.setItem(storageKey, 'true');
}
