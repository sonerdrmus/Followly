import { useRouter, type Href } from 'expo-router';
import {
  ChartNoAxesCombined,
  FileDown,
  Link2,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react-native';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { IconWell, type IconTone } from '@/components/ui/IconWell';
import { ListRow } from '@/components/ui/ListRow';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { useQuickActions } from '@/stores/quick-actions-store';
import { colors, radius } from '@/theme';

type Shortcut = {
  id: string;
  title: MessageKey;
  detail: MessageKey;
  icon: ReactElement;
  tone: IconTone;
  href: Href;
  replace?: boolean;
};

const shortcuts: readonly Shortcut[] = [
  {
    id: 'connect',
    title: 'shortcuts.connect',
    detail: 'shortcuts.connectDetail',
    icon: <Link2 />,
    tone: 'accent',
    href: '/connect-account',
  },
  {
    id: 'followers',
    title: 'shortcuts.followers',
    detail: 'shortcuts.followersDetail',
    icon: <Users />,
    tone: 'primary',
    href: '/followers',
    replace: true,
  },
  {
    id: 'analytics',
    title: 'shortcuts.analytics',
    detail: 'shortcuts.analyticsDetail',
    icon: <ChartNoAxesCombined />,
    tone: 'violet',
    href: '/analytics',
    replace: true,
  },
  {
    id: 'ai',
    title: 'shortcuts.ai',
    detail: 'shortcuts.aiDetail',
    icon: <MessageCircle />,
    tone: 'teal',
    href: '/ai-chat',
  },
  {
    id: 'search',
    title: 'shortcuts.search',
    detail: 'shortcuts.searchDetail',
    icon: <Search />,
    tone: 'neutral',
    href: '/profile-search',
  },
  {
    id: 'snapshots',
    title: 'shortcuts.snapshots',
    detail: 'shortcuts.snapshotsDetail',
    icon: <FileDown />,
    tone: 'neutral',
    href: { pathname: '/info', params: { topic: 'snapshots' } },
  },
];

export function QuickActionsSheet() {
  const router = useRouter();
  const open = useQuickActions((state) => state.open);
  const hide = useQuickActions((state) => state.hide);
  const { t } = useTranslation();

  return (
    <BottomSheet open={open} onClose={hide} title={t('nav.shortcuts')} snapPoints={['70%']}>
      <View style={styles.list}>
        {shortcuts.map((item) => (
          <ListRow
            key={item.id}
            title={t(item.title)}
            detail={t(item.detail)}
            leading={<IconWell icon={item.icon} tone={item.tone} />}
            testID={`shortcut-${item.id}`}
            onPress={() => {
              hide();
              if (item.replace) {
                router.navigate(item.href);
              } else {
                router.push(item.href);
              }
            }}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    marginHorizontal: -16,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
  },
});
