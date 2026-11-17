import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

type DividerProps = {
  inset?: boolean | number;
};

export function Divider({ inset = false }: DividerProps) {
  const offset = inset === true ? spacing.lg : typeof inset === 'number' ? inset : 0;
  return <View style={[styles.line, offset ? { marginLeft: offset } : null]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    alignSelf: 'stretch',
  },
});
