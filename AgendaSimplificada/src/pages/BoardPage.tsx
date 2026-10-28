import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  OrganizationCard,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function BoardPage() {
  const content = institutionalContent.BoardPage;
  return (
    <A4Page definition={pagePlan[5]}>
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
      <div className={"grid"}>
        {" "}
        <OrganizationCard className={"card"}>
          {" "}
          <div className={"cardHead"}>
            {" "}
            <div>
              {" "}
              <p className={"cardTitle"}>{content.cardTitle}</p>{" "}
              <p className={"cardHint"}>{content.cardHint}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge}</span>{" "}
          </div>{" "}
          <div className={"cardBody"}>
            {" "}
            <div className={"list"}>
              {" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role}</p>{" "}
                  <p className={"name"}>{content.name}</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_2}</p>{" "}
                  <p className={"name"}>{content.name_2}</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_3}</p>{" "}
                  <p className={"name"}>{content.name_3}</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_4}</p>{" "}
                  <p className={"name"}>{content.name_4}</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_5}</p>{" "}
                  <p className={"name"}>{content.name_5}</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_6}</p>{" "}
                  <p className={"name"}>{content.name_6}</p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"card"}>
          {" "}
          <div className={"cardHead"}>
            {" "}
            <div>
              {" "}
              <p className={"cardTitle"}>{content.cardTitle_2}</p>{" "}
              <p className={"cardHint"}>{content.cardHint_2}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_2}</span>{" "}
          </div>{" "}
          <div className={"cardBody"}>
            {" "}
            <div className={"list"}>
              {" "}
              <div className={"item"}>
                {" "}
                <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                <div className={"txt"}>
                  {" "}
                  <p className={"role"}>{content.role_7}</p>{" "}
                  <p className={"name"}>{content.name_7}</p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
      </div>{" "}
      <OrganizationCard className={"card conventional"}>
        {" "}
        <div className={"cardHead"}>
          {" "}
          <div>
            {" "}
            <p className={"cardTitle"}>{content.cardTitle_3}</p>{" "}
            <p className={"cardHint"}>{content.cardHint_3}</p>{" "}
          </div>{" "}
          <span className={"badge"}>{content.badge_3}</span>{" "}
        </div>{" "}
        <div className={"cardBody"}>
          {" "}
          <div className={"convList"}>
            {" "}
            <div className={"convItem"}>
              {" "}
              <p className={"convName"}>{content.convName}</p>{" "}
              <p className={"convRole"}>{content.convRole}</p>{" "}
              <p className={"convOrg"}>{content.convOrg}</p>{" "}
            </div>{" "}
            <div className={"convItem"}>
              {" "}
              <p className={"convName"}>{content.convName_2}</p>{" "}
              <p className={"convRole"}>{content.convRole_2}</p>{" "}
              <p className={"convOrg"}>{content.convOrg_2}</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </OrganizationCard>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
