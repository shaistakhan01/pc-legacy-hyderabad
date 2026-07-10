import { DatePicker, Button, Select } from "@/components/common";

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  onApply: () => void;
}

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

// Reused across the dashboard overview and every report page in this
// phase — one component, one set of preset buttons, consistent UX.
export function DateRangeFilter({ range, onChange, onApply }: DateRangeFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <DatePicker
        label="Start Date"
        value={range.startDate}
        onChange={(e) => onChange({ ...range, startDate: e.target.value })}
      />
      <DatePicker
        label="End Date"
        value={range.endDate}
        onChange={(e) => onChange({ ...range, endDate: e.target.value })}
      />
      <Select
        label="Quick Range"
        value=""
        onChange={(e) => {
          const preset = PRESETS.find((p) => p.label === e.target.value);
          if (preset) {
            onChange({ startDate: isoDateDaysAgo(preset.days), endDate: isoDateDaysAgo(0) });
          }
        }}
        placeholder="Choose a preset"
        options={PRESETS.map((p) => ({ value: p.label, label: p.label }))}
      />
      <Button onClick={onApply} variant="secondary">Apply</Button>
    </div>
  );
}