import { Fragment } from "react";
import { A4Page, PageFooter } from "../components/document/Primitives";
import { EventTimeline } from "../components/schedule/EventTimeline";
import { agenda } from "../data/agenda";
import type { MonthlyPageData, PageDefinition } from "../types/agenda";
export function MonthRail({ month }: { month: string }) {
  return (
    <aside className="monthRail" aria-hidden="true">
      <div className="monthRailInner">
        <p className="monthRailKicker">{agenda.title}</p>
        <p className="monthRailName">{month}</p>
      </div>
    </aside>
  );
}
export function MonthlySchedulePage({
  definition,
  data,
}: {
  definition: PageDefinition;
  data: MonthlyPageData;
}) {
  const copy = agenda.monthly;
  return (
    <A4Page definition={definition}>
      <MonthRail month={data.month} />
      <div className="monthMain">
        {data.showHeader && (
          <header className="monthTop">
            <div>
              <div className="kicker">
                <span className="dot" aria-hidden="true" />
                {copy.kicker}
              </div>
              <h1 className="monthTitle">{copy.title}</h1>
              <p className="sub monthSub">{data.description}</p>
            </div>
            <div className="tags">
              {data.tags.map((tag) => (
                <Fragment key={tag}>
                  {" "}
                  <span className="tag">{tag}</span>{" "}
                </Fragment>
              ))}
            </div>
          </header>
        )}
        <EventTimeline eventIds={data.eventIds} />
        <PageFooter className="footer monthFooter">
          <div>{agenda.title}</div>
          <div>{`${copy.footerPrefix}${data.month}`}</div>
        </PageFooter>
      </div>
    </A4Page>
  );
}
