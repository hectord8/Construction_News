import assert from "node:assert/strict";
import test from "node:test";
import {
  nextDateParam,
  optionalHttpUrlSchema,
  parseDateParam,
  slugSchema,
} from "../src/lib/validation";

test("slug validation accepts safe slugs and rejects unsafe values", () => {
  assert.equal(slugSchema.safeParse("materials-equipment").success, true);
  assert.equal(slugSchema.safeParse("../admin").success, false);
  assert.equal(slugSchema.safeParse("Hello World").success, false);
});

test("URL validation only permits HTTP and HTTPS", () => {
  assert.equal(optionalHttpUrlSchema.safeParse("").success, true);
  assert.equal(optionalHttpUrlSchema.safeParse("https://example.com/a").success, true);
  assert.equal(optionalHttpUrlSchema.safeParse("javascript:alert(1)").success, false);
  assert.equal(optionalHttpUrlSchema.safeParse("data:text/html,evil").success, false);
});

test("date parameters are validated and end dates are inclusive", () => {
  assert.equal(parseDateParam("not-a-date"), null);
  assert.equal(parseDateParam("2026-02-31"), null);
  assert.equal(parseDateParam("2026-09-01")?.toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(nextDateParam("2026-09-01")?.toISOString(), "2026-09-02T00:00:00.000Z");
});
