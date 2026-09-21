import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { createApp } from "./app.ts";

/**
 * Express 5 defaults to the "simple" query parser, which leaves the client's
 * nested `dateRange[minDate]` params as flat keys, so the routes read nothing and
 * every search silently widened back to today (305 shows became 20). The app sets
 * "extended" to restore the Express 4 behaviour; this locks that in.
 *
 * The probe route is deliberate: the real show routes would need a live upstream
 * to answer, and the configuration under test belongs to the app either way.
 */
test("parses the client's nested query params", async () => {
  const app = createApp();
  app.get("/__probe/query", (req, res) => res.json(req.query));

  const server = app.listen(0);
  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(
      `http://127.0.0.1:${port}/__probe/query?dateRange[minDate]=2026-09-20&dateRange[maxDate]=2026-09-27`,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      dateRange: { minDate: "2026-09-20", maxDate: "2026-09-27" },
    });
  } finally {
    server.close();
  }
});
