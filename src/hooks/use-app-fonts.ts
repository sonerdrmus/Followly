import { useFonts } from 'expo-font';

import { fontFamily } from '@/theme';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    [fontFamily.body]: require('../../assets/fonts/FollowlySans-Regular.ttf'),
    [fontFamily.bodyMedium]: require('../../assets/fonts/FollowlySans-Medium.ttf'),
    [fontFamily.bodySemibold]: require('../../assets/fonts/FollowlySans-SemiBold.ttf'),
    [fontFamily.display]: require('../../assets/fonts/FollowlyDisplay-Bold.ttf'),
    [fontFamily.displayBold]: require('../../assets/fonts/FollowlyDisplay-Black.ttf'),
  });

  return {
    loaded,
    error,
    ready: loaded || error != null,
  };
}
