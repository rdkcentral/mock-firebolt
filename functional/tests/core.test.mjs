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

import { expect, jest, test, afterAll, beforeAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20000);

beforeAll(async () => {
  const response = await utilities.mfState(true);
  expect(response).toBe("MF started successfully");
});

afterAll(async () => {
  //Stop Mock Firebolt
  const response = await utilities.killPort(9998);
  expect(response).toBe("Port Killed");
});

// Health check on default port with HTTP
test(`MF Startup/Health Check`, async () => {
  let healthCheckResponse = await utilities.callApi("/api/v1/healthcheck");
  expect(healthCheckResponse).toBeDefined();
  expect(healthCheckResponse.status).toBe(200);
});

// JsonRpc for CORE SDK
test(`Validate OPENRPC Response for CORE SDK`, async () => {
  const response = await utilities.fireboltCommand(
    JSON.stringify({
      method: "accessibility.closedCaptionsSettings",
      params: {},
      id: 0,
    })
  );
  expect(response.includes('"enabled":true')).toEqual(true);
});

// Health check through cli on default port
test(`Run MF cli command to perform heath check on default port`, async () => {
  const result = await utilities.callMfCli("--health");
  expect(result.includes("status: 'OK',")).toBe(true);
});
// Adding a user using CLI TO-DO
// Adding user using http call
test(`Add one user and Validate it`, async () => {
  const addUserResponse = await utilities.callApi(
    "/api/v1/user",
    "",
    "",
    "post"
  );
  const data = addUserResponse.data;
  expect(data.status).toBe("SUCCESS");
  const getAllUser = await utilities.callApi("/api/v1/user");
  const allUsers = getAllUser.data;
  expect(allUsers.users.indexOf(data.userId) > -1).toBe(true);
});

// Updating method for a particular user
test(`Validate a user's state after updating`, async () => {
  await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --upload ../examples/closed-captions-settings-reset.json --user 123 && cd ../../functional`,
    true
  );
  const result = await utilities.callMfCli("--user 123 --state");
  expect(result.includes(`"enabled": true`)).toBe(true);
});

// Dumping state for 12345 (default) user
test(`Dumping the state for default user`, async () => {
  const result = await utilities.callMfCli("--state");
  expect(result.includes(`"isDefaultUserState": true`)).toBe(true);
});

// Setting account.id for a particular user
test(`Run MF cli command to set account.id for 123 user`, async () => {
  const result = await utilities.callMfCli(
    `--method account.id --result "'111'" --user 123`
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
  const response = await utilities.callMfCli("--user 123 --state");
  expect(response.includes(`"result": "'111'"`)).toBe(true);
});

// Uploading closed captions settings for default user
test(`Run MF cli command to upload json settings for default user`, async () => {
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --upload ../examples/closed-captions-settings-reset.json && cd ../../functional`,
    true
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
  const response = await utilities.callMfCli("--user 12345 --state");
  expect(response.includes(`"enabled": true`)).toBe(true);
});

// Uploading invalid settings for a particular user
test(`Run MF cli command to upload an invalid json settings for user 123`, async () => {
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --upload ../examples//accessibility-voiceGuidance-invalid1.json --user 123 && cd ../../functional`,
    true
  );
  expect(result.includes(`"errorCode": "INVALID-STATE-DATA",`)).toBe(true);
});

// Setting method latency
test(`Run MF cli command to perform Method Latency`, async () => {
  const result = await utilities.callMfCli(
    `--method device.type --latency 2500 --latency 3500`
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
  const response = await utilities.callMfCli("--user 12345 --state");
  expect(response.includes(`"min": 2500,`)).toBe(true);
  expect(response.includes(`"max": 3500`)).toBe(true);
});

// Performing session start/stop
test(`Validate start and stop session`, async () => {
  const startResult = await utilities.callMfCli(`--session start`);
  expect(startResult.includes(`{ status: 'SUCCESS' }`)).toBe(true);
  const stopResult = await utilities.callMfCli(`--session stop`);
  expect(stopResult.includes(`status: 'SUCCESS'`)).toBe(true);
});

// Send event for default user
test(`Validate send event for default user`, async () => {
  await utilities.fireboltCommand(
    JSON.stringify({
      method: "accessibility.onVoiceGuidanceSettingsChanged",
      params: { listen: true },
      id: 4,
    })
  );
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --event ../examples/accessibility-onVoiceGuidanceSettingsChanged1.event.json && cd ../../functional`,
    true
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
});

// Broadcast event for a particular user
test(`Validate broadcast event for a user in a group and Validate that other user in that group getting that`, async () => {
  await utilities.fireboltCommand(
    JSON.stringify({
      method: "device.onNameChanged",
      params: { listen: true },
      id: 11,
    }),
    9998,
    "567~B"
  );
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --broadcastEvent ../examples/device-onNameChanged1.event.json --user 567~B && cd ../../functional`,
    true
  );
  expect(result.includes(`{ status: 'SUCCESS' }`)).toBe(true);
  const resultTwo = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --broadcastEvent ../examples/device-onNameChanged1.event.json --user 978~B && cd ../../functional`,
    true
  );
  expect(resultTwo.includes(`{ status: 'SUCCESS' }`)).toBe(true);
});

// Send event without any active listener
test(`Validate send event without an active listener`, async () => {
  const result = await utilities.callMfCli(
    `cd ../cli/src/ && node cli.mjs --event ../examples/accessibility-onClosedCaptionsSettingsChanged1.event.json && cd ../../functional`,
    true
  );
  expect(
    result.includes(
      ` "message": "Could not send accessibility.onClosedCaptionsSettingsChanged event because no listener is active"`
    )
  ).toBe(true);
});
