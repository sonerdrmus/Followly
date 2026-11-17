import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';

import { Typography } from './Typography';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: readonly (string | number)[];
  children: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  title,
  snapPoints = ['46%'],
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const presented = useRef(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
      presented.current = true;
      return;
    }
    if (presented.current) {
      sheetRef.current?.dismiss();
      presented.current = false;
    }
  }, [open]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <SheetBackdrop {...props} onPress={onClose} />,
    [onClose],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose
      enableDynamicSizing={false}
      onDismiss={onClose}
      snapPoints={[...snapPoints]}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      {title ? (
        <View style={styles.header}>
          <Typography variant="title" style={styles.title} accessibilityRole="header">
            {title}
          </Typography>
        </View>
      ) : null}
      <BottomSheetScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function SheetBackdrop({ style, onPress }: BottomSheetBackdropProps & { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('nav.closeSheet')}
      onPress={onPress}
      style={[style, styles.backdrop]}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    backgroundColor: colors.textMuted,
    width: 40,
    height: 4,
  },
  header: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  backdrop: {
    backgroundColor: colors.scrim,
  },
});
