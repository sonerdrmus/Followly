import { Badge } from '@/components/ui/Badge';

type ProfileBadgeProps = {
  label: string;
  premium?: boolean;
};

export function ProfileBadge({ label, premium = false }: ProfileBadgeProps) {
  return <Badge label={label} variant={premium ? 'premium' : 'neutral'} />;
}
