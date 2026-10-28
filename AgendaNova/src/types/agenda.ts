/** Civil dates, without UTC conversions. Labels retain the original editorial spelling. */
export type CivilDate = `${number}-${number}-${number}`;
export interface AgendaEvent {
  id: string;
  startDate: CivilDate;
  endDate: CivilDate | null;
  dayLabel: string;
  monthLabel: string;
  weekdayLabel: string;
  title: string;
  level: 2 | 3;
  rangeStyle: boolean;
  badges: { label: string; variant: string }[];
}
export interface PageDefinition {
  id: string;
  label: string;
  className: string;
  number: number | null;
  kind: "monthly" | "static";
}
export interface MonthlyPageData {
  id: string;
  month: string;
  showHeader: boolean;
  eventIds: string[];
  description: string | null;
  tags: string[];
}
export interface WeeklyActivity {
  id: string;
  time: string;
  title: string;
  location: string;
  highlight: boolean;
}
export interface WeeklyDayData {
  id: string;
  name: string;
  badge: string;
  sunday: boolean;
  activities: WeeklyActivity[];
}
export interface Role {
  label: string;
  value: string;
  valueTag: string;
  subline: string | null;
}
export interface CalendarMonthData {
  name: string;
  weekdays: string[];
  weeks: { label: string; className: string | null }[][];
}
