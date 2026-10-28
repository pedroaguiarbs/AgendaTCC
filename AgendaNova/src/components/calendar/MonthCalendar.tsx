import type { CalendarMonthData } from "../../types/agenda";
export function CalendarDay({
  day,
}: {
  day: CalendarMonthData["weeks"][number][number];
}) {
  return <td className={day.className ?? undefined}>{day.label}</td>;
}
export function MonthCalendar({ month }: { month: CalendarMonthData }) {
  return (
    <div className="monthBox">
      <div className="monthBar">{month.name}</div>
      <table className="miniCal">
        <thead>
          <tr>
            {month.weekdays.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, index) => (
                <CalendarDay key={index} day={day} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
