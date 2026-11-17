import { SegmentedControl } from './SegmentedControl';

type MetricSelectorProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function MetricSelector({ options, value, onChange }: MetricSelectorProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      accessibilityLabel="Metric"
    />
  );
}
