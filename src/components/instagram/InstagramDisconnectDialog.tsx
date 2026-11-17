import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';

type InstagramDisconnectDialogProps = {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function InstagramDisconnectDialog({
  visible,
  loading,
  onCancel,
  onConfirm,
}: InstagramDisconnectDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel={t('instagram.dismiss')}
      >
        <Pressable style={styles.card} onPress={() => undefined}>
          <Typography variant="title">{t('instagram.confirmTitle')}</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {t('instagram.confirmBody')}
          </Typography>
          <View style={styles.actions}>
            <Button
              label={t('instagram.keep')}
              variant="ghost"
              onPress={onCancel}
              disabled={loading}
            />
            <Button
              label={t('instagram.confirmAction')}
              variant="destructive"
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  card: {
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.cardElevated,
    padding: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
