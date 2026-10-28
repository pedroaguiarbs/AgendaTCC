import { PastoralMessagePage } from "../../pages/PastoralMessagePage";
import { ContentsPage } from "../../pages/ContentsPage";
import { AnnualCalendarPage } from "../../pages/AnnualCalendarPage";
import { ServiceHoursPage } from "../../pages/ServiceHoursPage";
import { WeeklySchedulePage } from "../../pages/WeeklySchedulePage";
import { BoardPage } from "../../pages/BoardPage";
import { CouncilsPage } from "../../pages/CouncilsPage";
import { CongregationalLeadersPage } from "../../pages/CongregationalLeadersPage";
import { FieldDepartmentsPage1 } from "../../pages/FieldDepartmentsPage1";
import { FieldDepartmentsPage2 } from "../../pages/FieldDepartmentsPage2";
import { HeadquartersDepartmentsPage1 } from "../../pages/HeadquartersDepartmentsPage1";
import { HeadquartersDepartmentsPage2 } from "../../pages/HeadquartersDepartmentsPage2";
import { ClosingPage } from "../../pages/ClosingPage";
import type { ComponentType } from "react";
import { pagePlan } from "../../data/page-plan";
import { monthlyPages } from "../../data/monthly-pages";
import { MonthlySchedulePage } from "../../pages/MonthlySchedulePage";
const staticPages: Record<string, ComponentType> = {
  "page-01": PastoralMessagePage,
  "page-02": ContentsPage,
  "page-03": AnnualCalendarPage,
  "page-04": ServiceHoursPage,
  "page-05": WeeklySchedulePage,
  "page-06": BoardPage,
  "page-07": CouncilsPage,
  "page-08": CongregationalLeadersPage,
  "page-09": FieldDepartmentsPage1,
  "page-10": FieldDepartmentsPage2,
  "page-11": HeadquartersDepartmentsPage1,
  "page-12": HeadquartersDepartmentsPage2,
  "page-34": ClosingPage,
};
export function AgendaDocument() {
  return (
    <main className="wrap flex flex-col items-center gap-[18px]">
      {pagePlan.map((page) => {
        const StaticPage = staticPages[page.id];
        if (StaticPage) return <StaticPage key={page.id} />;
        const data = monthlyPages.find((item) => item.id === page.id);
        if (!data) throw new Error(`Missing page ${page.id}`);
        return (
          <MonthlySchedulePage key={page.id} definition={page} data={data} />
        );
      })}
    </main>
  );
}
