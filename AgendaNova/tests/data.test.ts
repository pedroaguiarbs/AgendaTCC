import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../src/data/events";
import { pagePlan } from "../src/data/page-plan";
import { monthlyPages } from "../src/data/monthly-pages";
import { weeklySchedule } from "../src/data/weekly-schedule";
test("editorial plan preserves 34 sheets and numbering from the contents", () => {
  assert.equal(pagePlan.length, 34);
  assert.equal(pagePlan[0].number, null);
  assert.deepEqual(
    pagePlan.slice(1).map((page) => page.number),
    Array.from({ length: 33 }, (_, i) => i + 1),
  );
  assert.equal(new Set(pagePlan.map((page) => page.id)).size, 34);
});
test("all 170 source events appear exactly once in the monthly page plan", () => {
  assert.equal(events.length, 170);
  assert.equal(monthlyPages.length, 21);
  const references = monthlyPages.flatMap((page) => page.eventIds);
  assert.equal(new Set(references).size, references.length);
  assert.deepEqual(
    [...references].sort(),
    events.map((event) => event.id).sort(),
  );
  assert.deepEqual(
    monthlyPages.map((page) => page.id),
    pagePlan.filter((page) => page.kind === "monthly").map((page) => page.id),
  );
});
test("civil dates are valid and ranges do not go backwards", () => {
  for (const event of events) {
    for (const date of [event.startDate, event.endDate].filter(
      Boolean,
    ) as string[]) {
      assert.equal(
        new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10),
        date,
        event.id,
      );
    }
    if (event.endDate) assert.ok(event.endDate >= event.startDate, event.id);
    assert.ok(event.title.trim(), event.id);
  }
});
test("weekly schedule preserves seven days and unique activities", () => {
  assert.equal(weeklySchedule.length, 7);
  const ids = weeklySchedule.flatMap((day) =>
    day.activities.map((activity) => activity.id),
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 14);
});

test("contents references resolve to numbered pages, including each month", async () => {
  const { opening, organization, months, closing } = await import(
    "../src/data/contents"
  );
  assert.equal(months.length, 11);
  for (const entry of [...opening, ...organization, ...months, closing]) {
    assert.ok(
      pagePlan.find((page) => page.id === entry.pageId)?.number,
      entry.label,
    );
  }
});
