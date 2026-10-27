import React from "react";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";

export type DateRange = [Dayjs, Dayjs];

/** The last `days` days, today included. */
export const lastDays = (days: number): DateRange => [dayjs().subtract(days - 1, "day").startOf("day"), dayjs().endOf("day")];

/** A range as the API's `from` / `to` query (YYYY-MM-DD); both left out for "all time". */
export const rangeParams = (range: DateRange | null) =>
  range ? { from: range[0].format("YYYY-MM-DD"), to: range[1].format("YYYY-MM-DD") } : {};

const PRESETS: { label: string; value: DateRange }[] = [
  { label: "Last 7 days", value: lastDays(7) },
  { label: "Last 30 days", value: lastDays(30) },
  { label: "Last 90 days", value: lastDays(90) },
  { label: "This year", value: [dayjs().startOf("year"), dayjs().endOf("day")] },
];

interface DateRangeFilterProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  /** Clearing it means all time; without this the range can't be cleared. */
  allowAllTime?: boolean;
}

/** A from–to date filter with the usual presets. Days after today can't be picked: no counts exist for them. */
const DateRangeFilter = ({ value, onChange, allowAllTime = false }: DateRangeFilterProps) => (
  <DatePicker.RangePicker
    value={value}
    onChange={(dates) => onChange(dates?.[0] && dates[1] ? [dates[0], dates[1]] : null)}
    presets={PRESETS}
    allowClear={allowAllTime}
    placeholder={allowAllTime ? ["All time", "All time"] : undefined}
    disabledDate={(day) => day.isAfter(dayjs(), "day")}
    format="MMM D, YYYY"
  />
);

export default DateRangeFilter;
