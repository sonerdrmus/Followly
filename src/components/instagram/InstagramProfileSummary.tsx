import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { InstagramAccount } from '@/types/instagram';

import { InstagramAccountCard } from './InstagramAccountCard';

type InstagramProfileSummaryProps = {
  account: InstagramAccount;
};

export function InstagramProfileSummary({ account }: InstagramProfileSummaryProps) {
  const { t, locale } = useTranslation();
  const counts = [
    ['instagram.countFollowers', account.followersCount],
    ['instagram.countFollowing', account.followsCount],
    ['instagram.countMedia', account.mediaCount],
  ] as const satisfies readonly (readonly [MessageKey, number | null])[];

  return (
    <Surface style={styles.card}>
      <InstagramAccountCard account={account} />
      <Typography variant="caption" color={colors.textSecondary}>
        {account.accountType
          ? account.accountType === 'Media_Creator'
            ? t('instagram.typeCreator')
            : account.accountType === 'Business'
              ? t('instagram.typeBusiness')
              : account.accountType
          : t('instagram.typeUnavailable')}
      </Typography>
      <View style={styles.counts}>
        {counts.map(([label, value]) => (
          <View key={label} style={styles.count}>
            <Typography variant="title" tabular>
              {value === null ? '—' : new Intl.NumberFormat(locale).format(value)}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {value === null ? t('instagram.countUnavailable', { label: t(label) }) : t(label)}
            </Typography>
          </View>
        ))}
      </View>
      <Typography variant="caption" color={colors.textMuted}>
        {account.lastSyncedAt
          ? t('instagram.lastSynced', {
              when: new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(account.lastSyncedAt)),
            })
          : t('instagram.notSynced')}
      </Typography>
      {account.scopes.length > 0 &&
      !account.scopes.includes('instagram_basic') &&
      !account.scopes.includes('instagram_business_basic') ? (
        <Typography variant="caption" color={colors.warning}>
          {t('instagram.limitedScopes')}
        </Typography>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  counts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  count: {
    flex: 1,
    gap: 2,
  },
});
