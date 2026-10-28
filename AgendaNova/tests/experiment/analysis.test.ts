import test from "node:test";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import { normalizeText, comparePixels } from "../../scripts/experiment/analyze";
test("text normalization preserves accents and meaningful punctuation", () => {
  assert.equal(normalizeText("  Programação\n MENSAL "), "programação mensal");
  assert.notEqual(normalizeText("Programação"), normalizeText("Programacao"));
});
test("pixel metrics have fixed threshold, correct denominator and visible diff", () => {
  const reference = new PNG({ width: 2, height: 1 });
  reference.data.fill(255);
  const actual = PNG.sync.read(PNG.sync.write(reference));
  assert.equal(comparePixels(actual, reference).changedFraction, 0);
  actual.data[0] = 0;
  const result = comparePixels(actual, reference);
  assert.equal(result.changedFraction, 0.5);
  assert.equal(result.meanAbsoluteError, 255 / 6);
  assert.equal(result.diff.data[0], 255);
  assert.equal(result.diff.data[1], 0);
});
