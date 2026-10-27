import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import { A4Page, PageFooter } from "../components/document/Primitives";
export function ClosingPage() {
  const content = institutionalContent.ClosingPage;
  return (
    <A4Page definition={pagePlan[33]}>
      {" "}
      <div className={"closingWrap"}>
        {" "}
        <div className={"closingContent"}>
          {" "}
          <p className={"closingKicker"}>{content.closingKicker}</p>{" "}
          <h1 className={"closingTitle"}>
            {content.closingTitle}
            <span className={"closingTitleSep"}>{content.closingTitleSep}</span>
            {content.closingTitle_2}
          </h1>{" "}
          <div className={"closingRule"} aria-hidden={"true"}></div>{" "}
          <blockquote className={"closingVerse"}>
            {" "}
            <span className={"closingQuoteMark"} aria-hidden={"true"}>
              {content.closingQuoteMark}
            </span>
            {content.closingVerse}
            <span className={"closingQuoteMark"} aria-hidden={"true"}>
              {content.closingQuoteMark_2}
            </span>{" "}
            <span className={"closingVerseRef"}>
              {content.closingVerseRef}
              <small>{content.small}</small>
            </span>{" "}
          </blockquote>{" "}
          <div
            className={"closingRule closingRule--soft"}
            aria-hidden={"true"}
          ></div>{" "}
          <div className={"closingSignature"}>
            {" "}
            <p className={"closingName"}>{content.closingName}</p>{" "}
            <p className={"closingRole"}>
              {content.closingRole}
              <br />
              {content.closingRole_2}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
