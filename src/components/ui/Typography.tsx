import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useFontStatus } from '@/hooks/font-status';
import { colors, fontFamily as families, textStyles, type TextVariant } from '@/theme';

const secondaryVariants = new Set<TextVariant>(['caption', 'label']);

type TypographyProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  strong?: boolean;
  /** Lines figures up in columns. Display faces already do this. */
  tabular?: boolean;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Typography({
  variant = 'body',
  color,
  strong = false,
  tabular = false,
  children,
  style,
  ...rest
}: TypographyProps) {
  const { loaded } = useFontStatus();
  const token = textStyles[variant];
  const { fontFamily, ...withoutFont } = token;
  const resolvedColor =
    color ?? (secondaryVariants.has(variant) ? colors.textSecondary : colors.textPrimary);
  const face = strong ? families.bodySemibold : fontFamily;

  return (
    <Text
      {...rest}
      style={[
        withoutFont,
        loaded ? { fontFamily: face } : strong ? { fontWeight: '600' } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        { color: resolvedColor },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
