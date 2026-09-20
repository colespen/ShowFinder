import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_WINDOW_DAYS, parseDateRange, todayYmd } from "./location.ts";

/**
 * The client's calendar bounds a range to the same window, so this is the half
 * that holds when a request arrives from anywhere else - a stale tab, a script,
 * or a hand-written URL.
 */

test("the window is fourteen days", () => {
  // Readme, calendar and server all state this; a change here is a product
  // decision rather than a refactor.
  assert.equal(MAX_WINDOW_DAYS, 14);
});

test("clamps a range wider than the window", () => {
  assert.deepEqual(parseDateRange({ minDate: "2026-09-01", maxDate: "2026-12-01" }), {
    minDate: "2026-9-1",
    maxDate: "2026-9-15",
  });
});

test("orders a reversed range before clamping it", () => {
  assert.deepEqual(parseDateRange({ minDate: "2026-09-20", maxDate: "2026-09-01" }), {
    minDate: "2026-9-1",
    maxDate: "2026-9-15",
  });
});

test("leaves a range inside the window alone", () => {
  assert.deepEqual(parseDateRange({ minDate: "2026-09-01", maxDate: "2026-09-03" }), {
    minDate: "2026-9-1",
    maxDate: "2026-9-3",
  });
});

test("falls back to today when the range is absent or unreadable", () => {
  const today = { minDate: todayYmd(), maxDate: todayYmd() };

  assert.deepEqual(parseDateRange(), today);
  assert.deepEqual(parseDateRange({}), today);
  assert.deepEqual(parseDateRange({ minDate: "not-a-date", maxDate: "2026-12-01" }), today);
});
