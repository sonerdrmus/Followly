import { StyleSheet, View, type DimensionValue } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { colors } from '@/theme';

/** A dashed horizontal guide, drawn with SVG so it renders the same on every platform. */
export function DashedRule({ top }: { top: DimensionValue }) {
  return (
    <View pointerEvents="none" style={[styles.rule, { top }]}>
      <Svg width="100%" height={1}>
        <Line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={colors.border} strokeDasharray="3 5" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  rule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
});
