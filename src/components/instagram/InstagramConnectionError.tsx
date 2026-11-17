import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

type InstagramConnectionErrorProps = {
  message: string;
};

export function InstagramConnectionError({ message }: InstagramConnectionErrorProps) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Typography variant="bodySmall" color={colors.danger}>
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
});
