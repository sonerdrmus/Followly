import { useTranslation } from '@/i18n/use-translation';

import { SegmentedControl } from './SegmentedControl';

type TimeRangeSelectorProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function TimeRangeSelector({ options, value, onChange }: TimeRangeSelectorProps) {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      accessibilityLabel={t('analytics.timeRange')}
    />
  );
}
