import { Search } from 'lucide-react-native';
import { useState } from 'react';

import { FollowerSearch } from '@/components/followers/FollowerSearch';
import { DetailScaffold } from '@/components/navigation/DetailScaffold';
import { FeatureEmptyState } from '@/components/status/FeatureEmptyState';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors } from '@/theme';

export default function ProfileSearchScreen() {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  return (
    <DetailScaffold title={t('search.title')}>
      <FollowerSearch
        value={query}
        onChange={setQuery}
        placeholder={t('search.placeholder')}
        editable={false}
        testID="profile-search"
      />
      <Typography variant="bodySmall" color={colors.textSecondary}>
        {t('search.body')}
      </Typography>
      <FeatureEmptyState
        icon={<Search />}
        title={t('search.empty')}
        description={t('search.emptyBody')}
        status="LIMITED_ACCESS"
      />
    </DetailScaffold>
  );
}
