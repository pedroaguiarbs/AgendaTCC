import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function PastoralMessagePage() {
  const content = institutionalContent.PastoralMessagePage;
  return (
    <A4Page definition={pagePlan[0]}>
      {" "}
      <PageHeader className={"editorialHeader"}>
        {" "}
        <span className={"editorialKicker"}>
          {content.editorialKicker}
        </span>{" "}
        <h1 className={"editorialTitle"}>{content.editorialTitle}</h1>{" "}
        <p className={"editorialSub"}>{content.editorialSub}</p>{" "}
      </PageHeader>{" "}
      <div className={"editorialBody"}>
        {" "}
        <p>
          <strong>{content.strong}</strong>
        </p>{" "}
        <p>
          {content.p}
          <i>{content.i}</i>
          {content.p_2}
        </p>{" "}
        <p>{content.p_3}</p> <p>{content.p_4}</p>{" "}
      </div>{" "}
      <div className={"editorialVerse"}>
        {content.editorialVerse}
        <span className={"editorialVerseRef"}>
          {content.editorialVerseRef}
          <small className={"editorialVerseVersion"}>
            {content.editorialVerseVersion}
          </small>{" "}
        </span>{" "}
      </div>{" "}
      <div className={"editorialSignature"}>
        {" "}
        <strong>{content.strong_2}</strong> <span>{content.span}</span>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
