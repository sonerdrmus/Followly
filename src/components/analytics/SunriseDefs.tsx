import { LinearGradient, Stop } from 'react-native-svg';

import { sunrise } from '@/theme';

/** Horizontal sunrise gradient for chart strokes. Place inside <Defs>. */
export function SunriseStroke({ id }: { id: string }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      {sunrise.map((color, index) => (
        <Stop key={color} offset={index / (sunrise.length - 1)} stopColor={color} />
      ))}
    </LinearGradient>
  );
}

/** Vertical magenta wash under a line. Place inside <Defs>. */
export function SunriseFill({ id, strength = 0.22 }: { id: string; strength?: number }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#D62976" stopOpacity={strength} />
      <Stop offset="1" stopColor="#962FBF" stopOpacity={0} />
    </LinearGradient>
  );
}
