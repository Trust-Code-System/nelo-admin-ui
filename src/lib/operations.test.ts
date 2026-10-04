import test from "node:test";
import assert from "node:assert/strict";
import { minorUnits, wholeNumber, mutate } from "./operations.ts";
import { AdminApi } from "./admin-api.ts";
test("prices are converted from decimal amounts to exact minor units", () => {
  assert.equal(minorUnits("45000"), 4500000);
  assert.equal(minorUnits("0.29"), 29);
  assert.equal(minorUnits("12.3"), 1230);
  for (const value of ["12.345", "-1", "NaN", "1e3", "9007199254740999"])
    assert.throws(() => minorUnits(value));
});
test("stock rejects fractions, negative values and overflow", () => {
  assert.equal(wholeNumber("10"), 10);
  for (const v of ["1.2", "-1", "", "9007199254740999"])
    assert.throws(() => wholeNumber(v));
});
test("HTTP 200 union failures do not report a successful customer update", async () => {
  const api = new AdminApi(
    "https://backend.example/admin-api",
    async () =>
      new Response(
        JSON.stringify({
          data: {
            updateCustomer: {
              __typename: "EmailAddressConflictError",
              errorCode: "EMAIL_ADDRESS_CONFLICT_ERROR",
              message: "Email is already in use",
            },
          },
        }),
      ),
  );
  await assert.rejects(
    mutate(api, "ng", "updateCustomer", { input: { id: "customer" } }),
    /already in use/,
  );
});
test("partial variant writes are reported as uncertain instead of silently successful", async () => {
  const api = new AdminApi(
    "https://backend.example/admin-api",
    async () =>
      new Response(JSON.stringify({ data: { updateProductVariants: [null] } })),
  );
  await assert.rejects(
    mutate(api, "ng", "updateProductVariants", { input: [{ id: "variant" }] }),
    /incomplete result/,
  );
});
test("opaque record IDs and version guards reach the commission mutation unchanged", async () => {
  let body: Record<string, unknown> = {};
  const api = new AdminApi(
    "https://backend.example/admin-api",
    async (_url, options) => {
      body = JSON.parse(String(options?.body));
      return new Response(
        JSON.stringify({
          data: { transitionBespokeProject: { id: "opaque-id" } },
        }),
      );
    },
  );
  await mutate(api, "ng", "transitionBespokeProject", {
    input: { id: "opaque-id", version: 7, stage: "proposal" },
  });
  assert.deepEqual(body.variables, {
    input: { id: "opaque-id", version: 7, stage: "proposal" },
  });
});
