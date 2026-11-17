import { SegmentedControl } from '@/components/analytics/SegmentedControl';
import { growthRanges, type GrowthRange } from '@/types/account';

const labels: Record<GrowthRange, string> = {
  '7D': 'Last 7 days',
  '30D': 'Last 30 days',
  '90D': 'Last 90 days',
  '1Y': 'Last year',
};

const options = growthRanges.map((range) => labels[range]);

type AnalyticsTimeRangeProps = {
  value: GrowthRange;
  onChange: (value: GrowthRange) => void;
};

export function AnalyticsTimeRange({ value, onChange }: AnalyticsTimeRangeProps) {
  return (
    <SegmentedControl
      options={options}
      value={labels[value]}
      onChange={(next) => {
        const range = growthRanges.find((item) => labels[item] === next);
        if (range) {
          onChange(range);
        }
      }}
      accessibilityLabel="Analytics time range"
    />
  );
}
