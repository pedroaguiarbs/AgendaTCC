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
export function FieldDepartmentsPage1() {
  const content = institutionalContent.FieldDepartmentsPage1;
  return (
    <A4Page definition={pagePlan[8]}>
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
              <RoleRow role={roles[0]} /> <RoleRow role={roles[1]} />{" "}
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
              <RoleRow role={roles[2]} />{" "}
              <div className={"roleRow"}>
                {" "}
                <p className={"roleLabel"}>{content.roleLabel}</p>{" "}
                <div className={"nameChips"}>
                  {" "}
                  <span className={"nameChip"}>{content.nameChip}</span>{" "}
                  <span className={"nameChip"}>{content.nameChip_2}</span>{" "}
                </div>{" "}
              </div>{" "}
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
              <RoleRow role={roles[3]} />{" "}
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
              <RoleRow role={roles[4]} />{" "}
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
