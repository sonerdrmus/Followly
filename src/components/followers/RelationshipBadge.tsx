import { Badge } from '@/components/ui/Badge';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import type { RelationshipType } from '@/types/follower';

const variants = {
  new: 'insight',
  lost: 'neutral',
  not_following_back: 'premium',
  not_followed_back: 'premium',
  mutual: 'success',
} as const;

type RelationshipBadgeProps = {
  type: RelationshipType;
};

export function RelationshipBadge({ type }: RelationshipBadgeProps) {
  const { t } = useTranslation();
  return <Badge label={relationshipLabel(t, type)} variant={variants[type]} />;
}

export function relationshipLabel(t: (key: MessageKey) => string, type: RelationshipType): string {
  return t(`followers.category.${type}.label` as MessageKey);
}
