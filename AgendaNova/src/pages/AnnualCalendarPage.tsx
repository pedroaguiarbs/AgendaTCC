import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import { MonthCalendar } from "../components/calendar/MonthCalendar";
import { calendarMonths } from "../data/calendar";
import { A4Page, PageFooter } from "../components/document/Primitives";
export function AnnualCalendarPage() {
  const content = institutionalContent.AnnualCalendarPage;
  return (
    <A4Page definition={pagePlan[2]}>
      {" "}
      <header className={"calTop"}>
        {" "}
        <h1 className={"calTitle"}>
          {content.calTitle}
          <span className={"calYear"}>{content.calYear}</span>
        </h1>{" "}
        <p className={"calSub"}>{content.calSub}</p>{" "}
      </header>{" "}
      <div
        className={"calGrid calendarMain"}
        aria-label={"Calendário anual 2026"}
      >
        {" "}
        <MonthCalendar month={calendarMonths[0]} />{" "}
        <MonthCalendar month={calendarMonths[1]} />{" "}
        <MonthCalendar month={calendarMonths[2]} />{" "}
        <MonthCalendar month={calendarMonths[3]} />{" "}
        <MonthCalendar month={calendarMonths[4]} />{" "}
        <MonthCalendar month={calendarMonths[5]} />{" "}
        <MonthCalendar month={calendarMonths[6]} />{" "}
        <MonthCalendar month={calendarMonths[7]} />{" "}
        <MonthCalendar month={calendarMonths[8]} />{" "}
        <MonthCalendar month={calendarMonths[9]} />{" "}
        <MonthCalendar month={calendarMonths[10]} />{" "}
        <MonthCalendar month={calendarMonths[11]} />{" "}
      </div>{" "}
      <PageFooter className={"footer calFooter"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
