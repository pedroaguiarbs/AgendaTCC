import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  OrganizationCard,
  PageFooter,
  PageHeader,
} from "../components/document/Primitives";
export function CongregationalLeadersPage() {
  const content = institutionalContent.CongregationalLeadersPage;
  return (
    <A4Page definition={pagePlan[7]}>
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
      <div className={"areaGrid"}>
        {" "}
        <OrganizationCard className={"areaCard"}>
          {" "}
          <div className={"areaHead"}>
            {" "}
            <div>
              {" "}
              <p className={"areaTitle"}>{content.areaTitle}</p>{" "}
              <p className={"areaSupervisor"}>
                {" "}
                <span>{content.span}</span>
                {content.areaSupervisor}
              </p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge}</span>{" "}
          </div>{" "}
          <div className={"areaBody"}>
            {" "}
            <div className={"congList"}>
              {" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_2}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_2}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_3}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_3}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_4}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_4}</p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"areaCard"}>
          {" "}
          <div className={"areaHead"}>
            {" "}
            <div>
              {" "}
              <p className={"areaTitle"}>{content.areaTitle_2}</p>{" "}
              <p className={"areaSupervisor"}>
                {" "}
                <span>{content.span_2}</span>
                {content.areaSupervisor_2}
              </p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_2}</span>{" "}
          </div>{" "}
          <div className={"areaBody"}>
            {" "}
            <div className={"congList"}>
              {" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_5}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_5}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_6}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_6}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_7}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_7}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_8}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_8}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_9}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_9}</p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </OrganizationCard>{" "}
        <OrganizationCard className={"areaCard areaFull"}>
          {" "}
          <div className={"areaHead"}>
            {" "}
            <div>
              {" "}
              <p className={"areaTitle"}>{content.areaTitle_3}</p>{" "}
              <p className={"areaSupervisor"}>
                {" "}
                <span>{content.span_3}</span>
                {content.areaSupervisor_3}
              </p>{" "}
            </div>{" "}
            <span className={"badge"}>{content.badge_3}</span>{" "}
          </div>{" "}
          <div className={"areaBody"}>
            {" "}
            <div className={"congList"}>
              {" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_10}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_10}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_11}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_11}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_12}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_12}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_13}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_13}</p>{" "}
              </div>{" "}
              <div className={"congItem"}>
                {" "}
                <p className={"congName"}>{content.congName_14}</p>{" "}
                <p className={"congLeaders"}>{content.congLeaders_14}</p>{" "}
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
