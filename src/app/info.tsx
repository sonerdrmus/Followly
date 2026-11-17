import { useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { DetailScaffold } from '@/components/navigation/DetailScaffold';
import { LanguageSwitcher } from '@/components/settings/LanguageSwitcher';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { IconWell } from '@/components/ui/IconWell';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { isInfoTopic } from '@/content/info-topics';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';

export default function InfoScreen() {
  const params = useLocalSearchParams<{ topic?: string | string[] }>();
  const raw = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const { t } = useTranslation();
  const topic = raw && isInfoTopic(raw) ? raw : null;
  const title = topic ? t(`info.${topic}.title` as MessageKey) : t('common.unavailable');

  return (
    <DetailScaffold title={title}>
      <View style={styles.head}>
        <IconWell icon={<Info />} tone="neutral" size="lg" />
        <Typography variant="h1">{title}</Typography>
        <DataReadinessBadge status="UNAVAILABLE" />
      </View>
      <Surface>
        <Typography variant="body" color={colors.textSecondary}>
          {topic ? t(`info.${topic}.body` as MessageKey) : t('common.sectionUnavailable')}
        </Typography>
      </Surface>
      {topic === 'account' ? <LanguageSwitcher /> : null}
    </DetailScaffold>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: spacing.md,
  },
});
