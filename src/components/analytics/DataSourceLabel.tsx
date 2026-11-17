import { StyleSheet, View } from 'react-native';

import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { DataProvenance } from '@/types/provenance';
import { formatShortDate } from '@/utils/format-date';

type DataSourceLabelProps = {
  provenance: DataProvenance;
};

/** Where the numbers on a screen come from, and how fresh they are. */
export function DataSourceLabel({ provenance }: DataSourceLabelProps) {
  const { t } = useTranslation();
  const updated = formatShortDate(provenance.updatedAt);
  const source = provenance.source
    ? t(`source.${provenance.source}` as MessageKey)
    : t('source.none');

  return (
    <View style={styles.wrap}>
      <View style={styles.line}>
        <DataReadinessBadge status={provenance.availability} />
        <Typography variant="caption" color={colors.textSecondary} style={styles.source}>
          {source}
          {updated ? ` · ${t('source.updated', { date: updated })}` : ''}
        </Typography>
      </View>
      {provenance.comparisonPeriod ? (
        <Typography variant="caption" color={colors.textMuted}>
          {provenance.comparisonPeriod}
        </Typography>
      ) : null}
      <Typography variant="caption" color={colors.textSecondary}>
        {provenance.note}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs + 2,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  source: {
    flexShrink: 1,
  },
});
