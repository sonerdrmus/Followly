import {
  Check,
  CircleDashed,
  CircleX,
  Clock,
  Download,
  Minus,
  Shield,
  Unlink,
  type LucideIcon,
} from 'lucide-react-native';

import type { DataReadiness } from '@/types/readiness';

type ReadinessTone = 'success' | 'insight' | 'premium' | 'warning' | 'neutral' | 'danger';

type ReadinessContent = {
  label: string;
  explanation: string;
  tone: ReadinessTone;
  icon: LucideIcon;
};

export const readinessContent: Record<DataReadiness, ReadinessContent> = {
  READY: {
    label: 'Ready',
    explanation: 'This view has the data it needs.',
    tone: 'success',
    icon: Check,
  },
  COLLECTING_DATA: {
    label: 'Collecting',
    explanation: 'Followly is gathering supported data from a connected source.',
    tone: 'insight',
    icon: Clock,
  },
  WAITING_FOR_SNAPSHOT: {
    label: 'Needs a snapshot',
    explanation:
      'A comparison needs an Instagram export you import. It does not appear on its own.',
    tone: 'premium',
    icon: Download,
  },
  INSUFFICIENT_DATA: {
    label: 'Not enough data',
    explanation: 'There is not enough stored history to show this.',
    tone: 'warning',
    icon: CircleDashed,
  },
  LIMITED_ACCESS: {
    label: 'Limited access',
    explanation: 'This depends on Instagram permissions and the account type.',
    tone: 'warning',
    icon: Shield,
  },
  UNAVAILABLE: {
    label: 'Unavailable',
    explanation: 'This appears when supported data exists.',
    tone: 'neutral',
    icon: Minus,
  },
  ERROR: {
    label: "Couldn't load",
    explanation: 'This could not be loaded.',
    tone: 'danger',
    icon: CircleX,
  },
  NOT_CONNECTED: {
    label: 'Not connected',
    explanation: 'Connect an eligible professional account to begin.',
    tone: 'neutral',
    icon: Unlink,
  },
};
