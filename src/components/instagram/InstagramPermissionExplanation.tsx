import { KeyRound, ShieldCheck, UserRound } from 'lucide-react-native';
import { Fragment, type ReactElement } from 'react';

import { Divider } from '@/components/ui/Divider';
import { IconWell, type IconTone } from '@/components/ui/IconWell';
import { ListRow } from '@/components/ui/ListRow';
import { Surface } from '@/components/ui/Surface';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';

const facts: readonly {
  title: MessageKey;
  body: MessageKey;
  icon: ReactElement;
  tone: IconTone;
}[] = [
  {
    title: 'instagram.permissionAccounts',
    body: 'instagram.permissionAccountsBody',
    icon: <UserRound />,
    tone: 'primary',
  },
  {
    title: 'instagram.permissionScope',
    body: 'instagram.permissionScopeBody',
    icon: <ShieldCheck />,
    tone: 'success',
  },
  {
    title: 'instagram.permissionPassword',
    body: 'instagram.permissionPasswordBody',
    icon: <KeyRound />,
    tone: 'neutral',
  },
];

export function InstagramPermissionExplanation() {
  const { t } = useTranslation();

  return (
    <Surface padding={0}>
      {facts.map((fact, index) => (
        <Fragment key={fact.title}>
          {index > 0 ? <Divider inset={76} /> : null}
          <ListRow
            title={t(fact.title)}
            detail={t(fact.body)}
            leading={<IconWell icon={fact.icon} tone={fact.tone} />}
          />
        </Fragment>
      ))}
    </Surface>
  );
}
