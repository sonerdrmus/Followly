import { useState } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

/**
 * Pressable with the pressed state tracked here and the style resolved before
 * it reaches the native view. NativeWind's Pressable wrapper drops style
 * callbacks on iOS and Android, which collapses row layouts; this avoids it.
 */
export function Touchable({ style, onPressIn, onPressOut, ...rest }: TouchableProps) {
  const [pressed, setPressed] = useState(false);
  const resolved = typeof style === 'function' ? style({ pressed, hovered: false }) : style;

  return (
    <Pressable
      {...rest}
      onPressIn={(event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={resolved}
    />
  );
}
