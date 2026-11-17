import type { MessageKey } from '@/i18n';

export function greetingForHour(hour: number): MessageKey {
  if (hour < 12) {
    return 'greeting.morning';
  }

  if (hour < 18) {
    return 'greeting.afternoon';
  }

  return 'greeting.evening';
}
