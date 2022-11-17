"use strict";

import { expect, jest, test, beforeAll, afterAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20010);

const httpPort = 3456;
const socketPort = 9876;

beforeAll(async () => {
  console.log(
    await utilities.mfState(
      true,
      ` -- --httpPort ${httpPort} --socketPort ${socketPort}`
    )
  );
});

afterAll(async () => {
  // to kill the Mock Firebolt
  console.log(await utilities.killPort(socketPort));
});

test(`MF Startup/Health Check on a custom port`, async () => {
  let healthCheckResponse = await utilities.callApi(
    "/api/v1/healthcheck",
    "",
    "",
    "GET",
    httpPort
  );
  expect(healthCheckResponse).toBeDefined();
  expect(healthCheckResponse.status).toBe(200);
});

test(`Validate heath check on a custom port`, async () => {
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --health --port ${httpPort} && cd ../../functional`,
    true
  );
  expect(result.includes("status: 'OK',")).toBe(true);
});
