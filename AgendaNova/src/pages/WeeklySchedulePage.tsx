import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import { WeeklyDay } from "../components/schedule/WeeklyDay";
import { weeklySchedule } from "../data/weekly-schedule";
import {
  A4Page,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function WeeklySchedulePage() {
  const content = institutionalContent.WeeklySchedulePage;
  return (
    <A4Page definition={pagePlan[4]}>
      {" "}
      <PageHeader className={"weekTop"}>
        {" "}
        <div className={"weekTopLeft"}>
          {" "}
          <div className={"weekKicker"}>
            {" "}
            <span className={"weekDot"} aria-hidden={"true"}></span>
            {content.weekKicker}
          </div>{" "}
          <h1 className={"weekTitle"}>{content.weekTitle}</h1>{" "}
          <p className={"weekSub"}>{content.weekSub}</p>{" "}
        </div>{" "}
        <div className={"weekTopRight"}>
          {" "}
          <span className={"weekPill"}>{content.weekPill}</span>{" "}
          <span className={"weekPill"}>{content.weekPill_2}</span>{" "}
          <span className={"weekPill"}>{content.weekPill_3}</span>{" "}
        </div>{" "}
      </PageHeader>{" "}
      <div className={"weekTimeline2"}>
        {" "}
        <div className={"weekCol"}>
          {" "}
          <WeeklyDay day={weeklySchedule[0]} />{" "}
          <WeeklyDay day={weeklySchedule[1]} />{" "}
          <WeeklyDay day={weeklySchedule[2]} />{" "}
        </div>{" "}
        <div className={"weekCol"}>
          {" "}
          <WeeklyDay day={weeklySchedule[3]} />{" "}
          <WeeklyDay day={weeklySchedule[4]} />{" "}
          <WeeklyDay day={weeklySchedule[5]} />{" "}
          <WeeklyDay day={weeklySchedule[6]} />{" "}
        </div>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
