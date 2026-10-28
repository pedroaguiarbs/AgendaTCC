import type {
  WeeklyActivity as Activity,
  WeeklyDayData,
} from "../../types/agenda";
export function WeeklyActivity({ activity }: { activity: Activity }) {
  return (
    <div className={`weekSlot${activity.highlight ? " weekSlot--main" : ""}`}>
      <span className="weekTime">{activity.time}</span>
      <div className="weekInfo">
        <p className="weekEvent">{activity.title}</p>
        <p className="weekMeta">{activity.location}</p>
      </div>
    </div>
  );
}
export function WeeklyDay({ day }: { day: WeeklyDayData }) {
  return (
    <div className={`weekDay${day.sunday ? " weekDay--sunday" : ""}`}>
      <div className="weekDayHead">
        <p className="weekDayName">{day.name}</p>
        <span className="weekDayBadge">{day.badge}</span>
      </div>
      <div className="weekSlots">
        {day.activities.map((activity) => (
          <WeeklyActivity key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
