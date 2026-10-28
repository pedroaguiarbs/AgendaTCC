import type { AgendaEvent } from "../../types/agenda";
import { eventById } from "../../data/events";
export function EventDate({ event }: { event: AgendaEvent }) {
  return (
    <div className="monthDate">
      <span className="monthDay">{event.dayLabel}</span>
      <span className="monthMonth">{event.monthLabel}</span>
      <span className="monthWeekday">{event.weekdayLabel}</span>
    </div>
  );
}
export function EventCard({ event }: { event: AgendaEvent }) {
  return (
    <article
      className={`monthEvent monthEvent--lvl${event.level}${event.rangeStyle ? " monthEvent--range" : ""}`}
      role="listitem"
      data-event-id={event.id}
    >
      <EventDate event={event} />
      <div className="monthCard">
        <p className="monthEventTitle">{event.title}</p>
        <p className="monthEventMeta">
          {event.badges.map((badge, index) => (
            <span key={index} className={badge.variant}>
              {badge.label}
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}
export function EventTimeline({ eventIds }: { eventIds: string[] }) {
  return (
    <div className="monthTimeline" role="list">
      {eventIds.map((id) => {
        const event = eventById.get(id);
        if (!event) throw new Error(`Evento não encontrado: ${id}`);
        return <EventCard key={id} event={event} />;
      })}
    </div>
  );
}
