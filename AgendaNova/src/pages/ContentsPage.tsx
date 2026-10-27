import { ContentsEntry } from "../components/document/ContentsEntry";
import { opening, organization, months, closing } from "../data/contents";
import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function ContentsPage() {
  const content = institutionalContent.ContentsPage;
  return (
    <A4Page definition={pagePlan[1]}>
      {" "}
      <PageHeader className={"top"}>
        {" "}
        <div>
          {" "}
          <div className={"kicker"}>
            {" "}
            <span className={"dot"} aria-hidden={"true"}></span>
            {content.kicker}
          </div>{" "}
          <h1>{content.h1}</h1> <p className={"sub"}>{content.sub}</p>{" "}
        </div>{" "}
        <div className={"tags"}>
          {" "}
          <span className={"tag"}>{content.tag}</span>{" "}
          <span className={"tag"}>{content.tag_2}</span>{" "}
          <span className={"tag"}>{content.tag_3}</span>{" "}
        </div>{" "}
      </PageHeader>{" "}
      <div className={"tocBody tocEditorial"}>
        {" "}
        <div className={"tocCol"}>
          {" "}
          <section className={"tocSection"} aria-label={"Abertura"}>
            {" "}
            <h2 className={"tocSectionTitle"}>
              {content.tocSectionTitle}
            </h2>{" "}
            {opening.map((entry) => (
              <ContentsEntry key={entry.pageId} entry={entry} />
            ))}{" "}
          </section>{" "}
          <section
            className={"tocSection"}
            aria-label={"Estrutura Organizacional"}
          >
            {" "}
            <h2 className={"tocSectionTitle"}>
              {content.tocSectionTitle_2}
            </h2>{" "}
            {organization.map((entry) => (
              <ContentsEntry key={entry.pageId} entry={entry} />
            ))}{" "}
          </section>{" "}
        </div>{" "}
        <section
          className={"tocSection tocMonths"}
          aria-label={"Programação Mensal"}
        >
          {" "}
          <div className={"tocMonthsHead"}>
            {" "}
            <h2 className={"tocSectionTitle"}>
              {content.tocSectionTitle_3}
            </h2>{" "}
            <p className={"tocMonthsSub"}>{content.tocMonthsSub}</p>{" "}
          </div>{" "}
          <div className={"tocMonthsGrid"}>
            {" "}
            {months.map((entry) => (
              <ContentsEntry key={entry.pageId} entry={entry} compact />
            ))}{" "}
          </div>{" "}
          <ContentsEntry entry={closing} final />{" "}
        </section>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
