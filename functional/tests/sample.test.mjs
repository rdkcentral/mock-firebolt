"use strict";

import { expect, jest, test, afterAll, beforeAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20000);

beforeAll(async () => {
  console.log(await utilities.mfState(true));
});

afterAll(async () => {
  //Stop Mock Firebolt
  console.log(await utilities.mfState(false));
  console.log(await utilities.killPort(9998));
});

test(`MF Startup/Health Check`, async () => {
  let healthCheckResponse = await utilities.callApi("/api/v1/healthcheck");
  expect(healthCheckResponse).toBeDefined();
  expect(healthCheckResponse.status).toBe(200);
});

test(`OPENRPC Response for CORE SDK`, async () => {
  const response = await utilities.fireboltCommand(
    JSON.stringify({
      method: "accessibility.closedCaptionsSettings",
      params: {},
      id: 0,
    })
  );
  expect(response.includes('"enabled":true')).toEqual(true);
});

test(`run MF cli command to perform heath check`, async () => {
  const result = await utilities.callMfCli("--health");
  expect(result.includes("status: 'OK',")).toBe(true);
});

test(`run MF cli command for user state`, async () => {
  const result = await utilities.callMfCli("--user 123~A --state");
  expect(result.includes("UserId: 123~A")).toBe(true);
});

test(`run MF cli command to dump the state for default user`, async () => {
  const result = await utilities.callMfCli("--state");
  expect(result.includes("UserId: 12345")).toBe(true);
});

test(`run MF cli command to set account.id for 123~A user`, async () => {
  const result = await utilities.callMfCli(
    `--method account.id --result "'111'" --user 123~A`
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
});

test(`run MF cli command to upload json settings for user 123~A`, async () => {
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --upload ../examples/closed-captions-settings-reset.json && cd ../../functional`,
    true
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
});
