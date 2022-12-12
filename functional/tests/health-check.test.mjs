/*
 * Copyright 2021 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

import { expect, jest, test, beforeAll, afterAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20010);

const httpPort = 3456;
const socketPort = 9876;

beforeAll(async () => {
  const response = await utilities.mfState(
    true,
    ` -- --httpPort ${httpPort} --socketPort ${socketPort}`
  );
  expect(response).toBe("MF started successfully");
});

afterAll(async () => {
  // to kill the Mock Firebolt
  const response = await utilities.killPort(socketPort);
  expect(response).toBe("Port Killed");
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
