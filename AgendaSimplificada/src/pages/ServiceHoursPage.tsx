import { pagePlan } from "../data/page-plan";
import { institutionalContent } from "../data/institutional";
import {
  A4Page,
  ContactItem,
  PageFooter,
  PageHeader,
  ServiceCard,
} from "../components/document/Primitives";
export function ServiceHoursPage() {
  const content = institutionalContent.ServiceHoursPage;
  return (
    <A4Page definition={pagePlan[3]}>
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
      <div className={"serviceLayout serviceBody"}>
        {" "}
        <div className={"serviceCol"}>
          {" "}
          <ServiceCard
            className={"serviceCard"}
            aria-label={"Secretaria da IEAD"}
          >
            {" "}
            <div className={"serviceCardHead"}>
              {" "}
              <div className={"serviceIcon"} aria-hidden={"true"}>
                {" "}
                <svg viewBox={"0 0 24 24"} fill={"none"}>
                  {" "}
                  <path
                    d={
                      "M4 20V6.5c0-.6.36-1.15.92-1.38l6-2.5c.69-.29 1.47-.29 2.16 0l6 2.5c.56.23.92.78.92 1.38V20"
                    }
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                  ></path>{" "}
                  <path
                    d={"M8 20v-4.2c0-.44.36-.8.8-.8h6.4c.44 0 .8.36.8.8V20"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                  ></path>{" "}
                  <path
                    d={
                      "M8 9h.01M12 9h.01M16 9h.01M8 12h.01M12 12h.01M16 12h.01"
                    }
                    stroke={"currentColor"}
                    strokeWidth={"2.6"}
                    strokeLinecap={"round"}
                  ></path>{" "}
                </svg>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className={"serviceTitle"}>{content.serviceTitle}</p>{" "}
                <p className={"serviceSub"}>{content.serviceSub}</p>{" "}
              </div>{" "}
              <span className={"serviceBadge"}>
                {content.serviceBadge}
              </span>{" "}
            </div>{" "}
            <div className={"serviceInfo"}>
              {" "}
              <div className={"serviceRow"}>
                {" "}
                <span className={"serviceLabel"}>
                  {content.serviceLabel}
                </span>{" "}
                <span className={"serviceValue"}>
                  {content.serviceValue}
                </span>{" "}
              </div>{" "}
              <div className={"serviceRow"}>
                {" "}
                <span className={"serviceLabel"}>
                  {content.serviceLabel_2}
                </span>{" "}
                <span className={"serviceValue"}>
                  {content.serviceValue_2}
                </span>{" "}
              </div>{" "}
              <div className={"serviceNote"}>
                {" "}
                <svg
                  className={"serviceNoteIcon"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  aria-hidden={"true"}
                >
                  {" "}
                  <path
                    d={"M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                  ></path>{" "}
                </svg>{" "}
                <span>{content.span}</span>{" "}
              </div>{" "}
            </div>{" "}
          </ServiceCard>{" "}
          <ServiceCard
            className={"serviceCard"}
            aria-label={"Atendimento Pastoral"}
          >
            {" "}
            <div className={"serviceCardHead"}>
              {" "}
              <div className={"serviceIcon is-pastoral"} aria-hidden={"true"}>
                {" "}
                <svg viewBox={"0 0 24 24"} fill={"none"}>
                  {" "}
                  <path
                    d={
                      "M7.5 18.5 4 20V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15h-7.2L7.5 18.5Z"
                    }
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinejoin={"round"}
                  ></path>{" "}
                  <path
                    d={"M7.2 8.3h9.6M7.2 11.2h6.3"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                  ></path>{" "}
                </svg>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className={"serviceTitle"}>{content.serviceTitle_2}</p>{" "}
                <p className={"serviceSub"}>{content.serviceSub_2}</p>{" "}
              </div>{" "}
              <span className={"serviceBadge"}>
                {content.serviceBadge_2}
              </span>{" "}
            </div>{" "}
            <div className={"serviceInfo"}>
              {" "}
              <div className={"serviceRow"}>
                {" "}
                <span className={"serviceLabel"}>
                  {content.serviceLabel_3}
                </span>{" "}
                <span className={"serviceValue"}>
                  {content.serviceValue_3}
                </span>{" "}
              </div>{" "}
              <div className={"serviceSplit"}>
                {" "}
                <div className={"serviceSlot"}>
                  {" "}
                  <span className={"serviceSlotLabel"}>
                    {content.serviceSlotLabel}
                  </span>{" "}
                  <span className={"serviceSlotValue"}>
                    {content.serviceSlotValue}
                  </span>{" "}
                </div>{" "}
                <div className={"serviceSlot"}>
                  {" "}
                  <span className={"serviceSlotLabel"}>
                    {content.serviceSlotLabel_2}
                  </span>{" "}
                  <span className={"serviceSlotValue"}>
                    {content.serviceSlotValue_2}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </ServiceCard>{" "}
        </div>{" "}
        <aside className={"serviceContacts"} aria-label={"Contatos oficiais"}>
          {" "}
          <div className={"serviceContactsHead"}>
            {" "}
            <div className={"serviceIcon is-contact"} aria-hidden={"true"}>
              {" "}
              <svg viewBox={"0 0 24 24"} fill={"none"}>
                {" "}
                <path
                  d={
                    "M16 3H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"
                  }
                  stroke={"currentColor"}
                  strokeWidth={"1.8"}
                ></path>{" "}
                <path
                  d={"M9 7h6M9 11h6M9 15h6"}
                  stroke={"currentColor"}
                  strokeWidth={"1.8"}
                  strokeLinecap={"round"}
                ></path>{" "}
              </svg>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className={"serviceContactsTitle"}>
                {content.serviceContactsTitle}
              </p>{" "}
              <p className={"serviceContactsSub"}>
                {content.serviceContactsSub}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={"contactList"}>
            {" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={
                        "M7 4h2l1 5-2 1c1.2 2.6 3.3 4.8 6 6l1-2 5 1v2c0 1.1-.9 2-2 2-8.3 0-15-6.7-15-15 0-1.1.9-2 2-2Z"
                      }
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinejoin={"round"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>{content.contactLabel}</p>{" "}
                  <p className={"contactValue"}>{content.contactValue}</p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                    ></path>{" "}
                    <path
                      d={"M3 12h18"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinecap={"round"}
                    ></path>{" "}
                    <path
                      d={
                        "M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3Z"
                      }
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>
                    {content.contactLabel_2}
                  </p>{" "}
                  <p className={"contactValue"}>
                    {content.contactValue_2}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={"M4 6h16v12H4V6Z"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinejoin={"round"}
                    ></path>{" "}
                    <path
                      d={"m4 7 8 6 8-6"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>
                    {content.contactLabel_3}
                  </p>{" "}
                  <p className={"contactValue"}>
                    {content.contactValue_3}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={
                        "M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
                      }
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                    ></path>{" "}
                    <path
                      d={"M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                    ></path>{" "}
                    <path
                      d={"M17.5 6.7h.01"}
                      stroke={"currentColor"}
                      strokeWidth={"3"}
                      strokeLinecap={"round"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>
                    {content.contactLabel_4}
                  </p>{" "}
                  <p className={"contactValue"}>
                    {content.contactValue_4}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={
                        "M14 4c.5 2.6 2.2 4.4 5 4.8V12c-2-.1-3.6-.8-5-2v6.2c0 2.6-2.2 4.8-5 4.8s-5-2.2-5-4.8 2.2-4.8 5-4.8c.4 0 .7.1 1 .1V14c-.3-.2-.7-.3-1-.3-1.2 0-2.2 1-2.2 2.3S7.8 18.3 9 18.3s2.2-1 2.2-2.3V4h2.8Z"
                      }
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinejoin={"round"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>
                    {content.contactLabel_5}
                  </p>{" "}
                  <p className={"contactValue"}>
                    {content.contactValue_5}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
            <ContactItem className={"contactItem"}>
              {" "}
              <div className={"contactLine"}>
                {" "}
                <span className={"contactIcon"} aria-hidden={"true"}>
                  {" "}
                  <svg viewBox={"0 0 24 24"} fill={"none"}>
                    {" "}
                    <path
                      d={
                        "M14 8h3V5h-3c-2.2 0-4 1.8-4 4v3H7v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1Z"
                      }
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinejoin={"round"}
                    ></path>{" "}
                  </svg>{" "}
                </span>{" "}
                <div className={"contactText"}>
                  {" "}
                  <p className={"contactLabel"}>
                    {content.contactLabel_6}
                  </p>{" "}
                  <p className={"contactValue"}>
                    {content.contactValue_6}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </ContactItem>{" "}
          </div>{" "}
          <div className={"serviceContactsHint"}>
            {" "}
            <span
              className={"serviceContactsHintDot"}
              aria-hidden={"true"}
            ></span>
            {content.serviceContactsHint}
          </div>{" "}
        </aside>{" "}
      </div>{" "}
      <PageFooter className={"footer"}>
        {" "}
        <div>{content.div}</div> <div>{content.div_2}</div>{" "}
      </PageFooter>{" "}
    </A4Page>
  );
}
