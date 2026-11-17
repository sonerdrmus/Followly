import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useFontStatus } from '@/hooks/font-status';
import { useTranslation } from '@/i18n/use-translation';
import { colors, fontFamily, icon, radius, spacing } from '@/theme';

import { Typography } from './Typography';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'name' | 'password' | 'off';
  keyboardType?: 'default' | 'email-address';
  textContentType?: 'emailAddress' | 'name' | 'password' | 'newPassword' | 'none';
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
  testID?: string;
};

/**
 * Instagram's sign-in field: the label sits inside the box and moves up
 * once there is text or focus. No animation; the layout simply changes.
 */
export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoComplete = 'off',
  keyboardType = 'default',
  textContentType = 'none',
  returnKeyType,
  onSubmitEditing,
  testID,
}: TextFieldProps) {
  const { loaded } = useFontStatus();
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const hidden = secureTextEntry && !visible;
  const raised = focused || value.length > 0;

  return (
    <View style={styles.field}>
      <View
        style={[styles.control, focused ? styles.focused : null, error ? styles.invalid : null]}
      >
        <View style={styles.stack}>
          <Typography
            variant={raised ? 'caption' : 'body'}
            color={colors.textSecondary}
            numberOfLines={1}
            style={raised ? styles.labelRaised : styles.labelResting}
            accessibilityElementsHidden
            importantForAccessibility="no"
            pointerEvents="none"
          >
            {label}
          </Typography>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={focused ? placeholder : undefined}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={hidden}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            autoComplete={autoComplete}
            keyboardType={keyboardType}
            textContentType={textContentType}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            selectionColor={colors.primary}
            accessibilityLabel={label}
            accessibilityHint={error}
            testID={testID}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.input,
              raised ? styles.inputRaised : styles.inputResting,
              loaded ? styles.inputFont : null,
            ]}
          />
        </View>
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? t('nav.hidePassword') : t('nav.showPassword')}
            onPress={() => setVisible((current) => !current)}
            hitSlop={8}
            style={styles.toggle}
          >
            {visible ? (
              <EyeOff color={colors.textPrimary} size={icon.size.md} strokeWidth={icon.stroke} />
            ) : (
              <Eye color={colors.textSecondary} size={icon.size.md} strokeWidth={icon.stroke} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Typography variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  control: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  focused: {
    borderColor: colors.textSecondary,
  },
  invalid: {
    borderColor: colors.danger,
  },
  stack: {
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
  },
  labelResting: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 17,
  },
  labelRaised: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 8,
  },
  input: {
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  inputResting: {
    height: 56,
    opacity: 1,
  },
  inputRaised: {
    height: 56,
    paddingTop: 18,
  },
  inputFont: {
    fontFamily: fontFamily.body,
  },
  toggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
