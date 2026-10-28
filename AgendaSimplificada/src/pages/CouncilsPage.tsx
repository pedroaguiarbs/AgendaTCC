import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  OrganizationCard,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function CouncilsPage() {
  const content = institutionalContent.CouncilsPage;
  return (
    <A4Page definition={pagePlan[6]}>
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
      <div className={"stack"}>
        {" "}
        <OrganizationCard className={"card"}>
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
            <div className={"grid2"}>
              {" "}
              <div className={"list"}>
                {" "}
                <div className={"item"}>
                  {" "}
                  <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                  <div className={"txt"}>
                    {" "}
                    <p className={"role"}>{content.role_8}</p>{" "}
                    <p className={"name"}>{content.name_8}</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className={"item"}>
                  {" "}
                  <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                  <div className={"txt"}>
                    {" "}
                    <p className={"role"}>{content.role_9}</p>{" "}
                    <p className={"name"}>{content.name_9}</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className={"item"}>
                  {" "}
                  <span className={"bullet"} aria-hidden={"true"}></span>{" "}
                  <div className={"txt"}>
                    {" "}
                    <p className={"role"}>{content.role_10}</p>{" "}
                    <p className={"name"}>{content.name_10}</p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className={"membersTitle"}>{content.membersTitle}</p>{" "}
                <div className={"members"}>
                  {" "}
                  <span className={"member"}>{content.member}</span>{" "}
                  <span className={"member"}>{content.member_2}</span>{" "}
                  <span className={"member"}>{content.member_3}</span>{" "}
                  <span className={"member"}>{content.member_4}</span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
