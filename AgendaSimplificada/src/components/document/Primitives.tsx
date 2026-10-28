import type { ComponentProps } from "react";
import type { PageDefinition } from "../../types/agenda";
/** No extra DOM wrappers: original selectors and page geometry remain valid. */
export function A4Page({
  definition,
  children,
}: {
  definition: PageDefinition;
  children: React.ReactNode;
}) {
  return (
    <section
      className={definition.className}
      aria-label={definition.label}
      data-page-id={definition.id}
    >
      {children}
    </section>
  );
}
export function PageHeader(props: ComponentProps<"header">) {
  return <header {...props} />;
}
export function PageFooter(props: ComponentProps<"footer">) {
  return <footer {...props} />;
}
export function OrganizationCard(props: ComponentProps<"article">) {
  return <article {...props} />;
}
export function ServiceCard(props: ComponentProps<"article">) {
  return <article {...props} />;
}
export function ContactItem(props: ComponentProps<"div">) {
  return <div {...props} />;
}
