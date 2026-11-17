import { Avatar } from '@/components/ui/Avatar';

type ProfileAvatarProps = {
  name: string;
  source?: string;
  online?: boolean;
};

export function ProfileAvatar({ name, source, online = false }: ProfileAvatarProps) {
  return <Avatar name={name} source={source} size="lg" ring online={online} />;
}
