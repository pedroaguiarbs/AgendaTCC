import type { WeeklyDayData } from "../types/agenda";
export const weeklySchedule: WeeklyDayData[] = [
  {
    id: "weekday-1",
    name: "Segunda-feira",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-1-1",
        time: "05h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
    ],
  },
  {
    id: "weekday-2",
    name: "Terça-feira",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-2-1",
        time: "05h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-2-2",
        time: "08h",
        title: "Oração das Heroínas da Fé",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-2-3",
        time: "19h30",
        title: "Culto de Ensino / Assembleia Geral",
        location: "Sede e Congregações",
        highlight: true,
      },
    ],
  },
  {
    id: "weekday-3",
    name: "Quarta-feira",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-3-1",
        time: "05h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-3-2",
        time: "19h30",
        title: "Culto dos Adolescentes",
        location: "Templo Sede",
        highlight: true,
      },
    ],
  },
  {
    id: "weekday-4",
    name: "Quinta-feira",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-4-1",
        time: "05h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-4-2",
        time: "08h",
        title: "Oração das Heroínas da Fé",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-4-3",
        time: "19h30",
        title: "Culto do Círculo de Oração",
        location: "Templo Sede",
        highlight: true,
      },
    ],
  },
  {
    id: "weekday-5",
    name: "Sexta-feira",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-5-1",
        time: "05h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
      {
        id: "activity-5-2",
        time: "22h",
        title: "Oração",
        location: "Templo Sede",
        highlight: false,
      },
    ],
  },
  {
    id: "weekday-6",
    name: "Sábado",
    badge: "Regular",
    sunday: false,
    activities: [
      {
        id: "activity-6-1",
        time: "19h30",
        title: "Culto de Jovens",
        location: "Templo Sede",
        highlight: true,
      },
    ],
  },
  {
    id: "weekday-7",
    name: "Domingo",
    badge: "Regular",
    sunday: true,
    activities: [
      {
        id: "activity-7-1",
        time: "08h",
        title: "EBD — Escola Bíblica Dominical",
        location: "Templo Sede",
        highlight: true,
      },
      {
        id: "activity-7-2",
        time: "19h",
        title: "Culto Evangelístico",
        location: "Templo Sede",
        highlight: true,
      },
    ],
  },
];
