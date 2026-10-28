import { events2 } from "./02";
import { events3 } from "./03";
import { events4 } from "./04";
import { events5 } from "./05";
import { events6 } from "./06";
import { events7 } from "./07";
import { events8 } from "./08";
import { events9 } from "./09";
import { events10 } from "./10";
import { events11 } from "./11";
import { events12 } from "./12";
export const events = [
  ...events2,
  ...events3,
  ...events4,
  ...events5,
  ...events6,
  ...events7,
  ...events8,
  ...events9,
  ...events10,
  ...events11,
  ...events12,
];
export const eventById = new Map(events.map((event) => [event.id, event]));
