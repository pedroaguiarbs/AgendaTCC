import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import { RoleRow } from "../components/organization/RoleRow";
import { roles } from "../data/organization";
import {
  A4Page,
  OrganizationCard,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function HeadquartersDepartmentsPage1() {
  const content = institutionalContent.HeadquartersDepartmentsPage1;
  return (
    <A4Page definition={pagePlan[10]}>
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
      <div className={"deptGrid"}>
        {" "}
        <OrganizationCard className={"deptCard"}>
          {" "}
          <div className={"deptHead"}>
            {" "}
            <div>
              {" "}
              <p className={"deptTitle"}>{content.deptTitle}</p>{" "}
              <p className={"deptSubtitle"}>{content.deptSubtitle}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge}</span>{" "}
          </div>{" "}
          <div className={"deptBody"}>
            {" "}
            <div className={"roles"}>
              {" "}
              <RoleRow role={roles[8]} />{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"deptCard"}>
          {" "}
          <div className={"deptHead"}>
            {" "}
            <div>
              {" "}
              <p className={"deptTitle"}>{content.deptTitle_2}</p>{" "}
              <p className={"deptSubtitle"}>{content.deptSubtitle_2}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_2}</span>{" "}
          </div>{" "}
          <div className={"deptBody"}>
            {" "}
            <div className={"roles"}>
              {" "}
              <RoleRow role={roles[9]} />{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"deptCard"}>
          {" "}
          <div className={"deptHead"}>
            {" "}
            <div>
              {" "}
              <p className={"deptTitle"}>{content.deptTitle_3}</p>{" "}
              <p className={"deptSubtitle"}>{content.deptSubtitle_3}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_3}</span>{" "}
          </div>{" "}
          <div className={"deptBody"}>
            {" "}
            <div className={"roles"}>
              {" "}
              <RoleRow role={roles[10]} />{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"deptCard"}>
          {" "}
          <div className={"deptHead"}>
            {" "}
            <div>
              {" "}
              <p className={"deptTitle"}>{content.deptTitle_4}</p>{" "}
              <p className={"deptSubtitle"}>{content.deptSubtitle_4}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_4}</span>{" "}
          </div>{" "}
          <div className={"deptBody"}>
            {" "}
            <div className={"roles"}>
              {" "}
              <RoleRow role={roles[11]} />{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"deptCard"}>
          {" "}
          <div className={"deptHead"}>
            {" "}
            <div>
              {" "}
              <p className={"deptTitle"}>{content.deptTitle_5}</p>{" "}
              <p className={"deptSubtitle"}>{content.deptSubtitle_5}</p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_5}</span>{" "}
          </div>{" "}
          <div className={"deptBody"}>
            {" "}
            <div className={"roles"}>
              {" "}
              <RoleRow role={roles[12]} />{" "}
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
