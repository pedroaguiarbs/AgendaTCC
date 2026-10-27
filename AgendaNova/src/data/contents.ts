export interface ContentsEntryData {
  label: string;
  pageId: string;
}
export const opening: ContentsEntryData[] = [
  { label: "Sumário", pageId: "page-02" },
  { label: "Calendário 2026", pageId: "page-03" },
  { label: "Horário de Atendimento", pageId: "page-04" },
  { label: "Programação Semanal", pageId: "page-05" },
];
export const organization: ContentsEntryData[] = [
  { label: "Lideranças do Campo", pageId: "page-06" },
  { label: "Administração e Conselhos", pageId: "page-07" },
  { label: "Dirigentes Congregacionais", pageId: "page-08" },
  { label: "Departamentos — Campo", pageId: "page-09" },
  { label: "Departamentos — Sede", pageId: "page-11" },
];
import { monthlyPages } from "./monthly-pages";
export const months: ContentsEntryData[] = monthlyPages
  .filter((page) => page.showHeader)
  .map((page) => ({ label: page.month, pageId: page.id }));
export const closing: ContentsEntryData = {
  label: "Encerramento",
  pageId: "page-34",
};
