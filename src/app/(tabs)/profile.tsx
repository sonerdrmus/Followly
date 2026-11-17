import { useRouter } from 'expo-router';
import {
  Bell,
  CreditCard,
  Info,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Shield,
  Unlink,
  type LucideIcon,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabScreen } from '@/components/navigation/TabScreen';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { IconButton } from '@/components/ui/IconButton';
import { ListRow } from '@/components/ui/ListRow';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import type { InfoTopic } from '@/content/info-topics';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { useAuthStore } from '@/stores/auth-store';
import { colors, fontFamily, spacing } from '@/theme';

type SettingItem = {
  topic: InfoTopic;
  label: MessageKey;
  detail: MessageKey;
  icon: LucideIcon;
};

const groups: readonly { title: MessageKey; items: readonly SettingItem[] }[] = [
  {
    title: 'profile.groupAccount',
    items: [
      {
        topic: 'account',
        label: 'profile.accountSettings',
        detail: 'profile.accountDetail',
        icon: Settings,
      },
      {
        topic: 'notifications',
        label: 'profile.notifications',
        detail: 'profile.notificationsDetail',
        icon: Bell,
      },
      {
        topic: 'privacy',
        label: 'profile.privacy',
        detail: 'profile.privacyDetail',
        icon: Shield,
      },
    ],
  },
  {
    title: 'profile.groupFollowly',
    items: [
      {
        topic: 'premium',
        label: 'profile.premium',
        detail: 'profile.premiumDetail',
        icon: CreditCard,
      },
      { topic: 'help', label: 'profile.help', detail: 'profile.helpDetail', icon: LifeBuoy },
      { topic: 'about', label: 'profile.about', detail: 'profile.aboutDetail', icon: Info },
    ],
  },
];

const stats = [
  ['profile.posts', 'Posts'],
  ['profile.followers', 'Followers'],
  ['profile.following', 'Following'],
] as const satisfies readonly (readonly [MessageKey, string])[];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const signingOut = useAuthStore((state) => state.loading);
  const { t } = useTranslation();
  const name = user?.displayName ?? t('profile.fallbackName');

  const openTopic = (topic: InfoTopic) => {
    router.push({ pathname: '/info', params: { topic } });
  };

  return (
    <TabScreen
      title={name}
      headerActions={
        <IconButton
          variant="bare"
          icon={<Menu />}
          accessibilityLabel={t('profile.accountSettings')}
          onPress={() => openTopic('account')}
          testID="profile-menu"
        />
      }
    >
      <View style={styles.identity}>
        <View style={styles.topRow}>
          <Avatar name={name} source={user?.avatarUrl ?? undefined} size="xxl" ring="seen" />
          <View style={styles.stats}>
            {stats.map(([key]) => (
              <View
                key={key}
                style={styles.stat}
                accessible
                accessibilityLabel={t('profile.statUnavailable', { label: t(key) })}
              >
                <Typography variant="h3" color={colors.textMuted} style={styles.statValue}>
                  —
                </Typography>
                <Typography variant="bodySmall">{t(key)}</Typography>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.copy}>
          <Typography variant="bodySmall" strong>
            {name}
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            {user?.email ?? t('profile.noEmail')}
          </Typography>
        </View>
        <View style={styles.buttons}>
          <Button
            label={t('common.connectInstagram')}
            size="sm"
            style={styles.grow}
            onPress={() => {
              router.push('/connect-account');
            }}
          />
          <Button
            label={t('profile.settings')}
            variant="secondary"
            size="sm"
            style={styles.grow}
            onPress={() => openTopic('account')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="label" color={colors.textSecondary}>
          {t('profile.instagram')}
        </Typography>
        <Surface padding={0}>
          <ListRow
            title={t('profile.connection')}
            detail={t('profile.connectionDetail')}
            leading={<Unlink color={colors.textPrimary} size={22} strokeWidth={1.75} />}
            footer={
              <View style={styles.rowStatus}>
                <DataReadinessBadge status="NOT_CONNECTED" />
              </View>
            }
            onPress={() => router.push('/connect-account')}
          />
        </Surface>
      </View>

      {groups.map((group) => (
        <View key={group.title} style={styles.section}>
          <Typography variant="label" color={colors.textSecondary}>
            {t(group.title)}
          </Typography>
          <Surface padding={0}>
            {group.items.map((item, index) => {
              const Glyph = item.icon;
              return (
                <Fragment key={item.topic}>
                  {index > 0 ? <Divider inset={54} /> : null}
                  <ListRow
                    title={t(item.label)}
                    detail={
                      item.topic === 'account' ? (user?.email ?? t(item.detail)) : t(item.detail)
                    }
                    leading={<Glyph color={colors.textPrimary} size={22} strokeWidth={1.75} />}
                    onPress={() => openTopic(item.topic)}
                  />
                </Fragment>
              );
            })}
          </Surface>
        </View>
      ))}

      <Surface padding={0}>
        <ListRow
          title={signingOut ? t('profile.signingOut') : t('profile.signOut')}
          destructive
          chevron={false}
          leading={<LogOut color={colors.danger} size={22} strokeWidth={1.75} />}
          onPress={() => {
            if (signingOut) {
              return;
            }
            void logout().then(() => {
              router.replace('/login');
            });
          }}
          testID="sign-out"
        />
      </Surface>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: 18,
  },
  copy: {
    gap: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  section: {
    gap: spacing.sm,
  },
  rowStatus: {
    marginTop: 4,
  },
});
