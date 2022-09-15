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

// sessionManagement: Tests

"use strict";

import fs from "fs";
import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as sessionManagement from "../../src/sessionManagement.mjs";

test(`sessionManagement.stopRecording works properly in case of throwing error`, () => {
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

describe(`Session`, () => {
  const session = new sessionManagement.Session();

  test(`should return null`, () => {
    const result = session.exportSession();
    expect(result).toBe(null);
  });
  test(`should return filepath`, () => {
    const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    const result = session.exportSession();
    expect(spy).toHaveBeenCalled();
    expect(result).toMatch(/(sessions)/);
    spy.mockClear();
  });
});

describe(`FireboltCall`, () => {
  const fireboltCall = new sessionManagement.FireboltCall(
    "Test Method",
    "Test Parameters"
  );
  test(`should instantiate`, () => {
    expect(fireboltCall.methodCall).toEqual("Test Method");
  });
});

test(`sessionManagement.startRecording works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  sessionManagement.startRecording();
  expect(spy).toHaveBeenCalled();
});

test(`sessionManagement.stopRecording works properly for file condition`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toMatch(/(sessions)/);
});

test(`sessionManagement.stopRecording works properly for else path`, () => {
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

test(`sessionManagement.isRecording works properly`, () => {
  if (true) {
    sessionManagement.startRecording();
    const result = sessionManagement.isRecording();
    expect(result).toBeTruthy();
    sessionManagement.stopRecording();
  }
  const result = sessionManagement.isRecording();
  expect(result).toBeFalsy();
});

test(`sessionManagement.addCall works properly`, () => {
  sessionManagement.startRecording();
  const result = sessionManagement.addCall("methodName", "Parameters");
  expect(result).toBeUndefined();
});

test(`verify sortJsonByTime method is working`, () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  session.sortJsonByTime({ "sessionStart": 1660644687500, "sessionEnd": 1660644699862, "calls": [ { "methodCall": "moneybadger.logMoneyBadgerLoaded", "params": { "startTime": 1660644697447, "version": "4.10.0-7e1cc95" }, "timestamp": 1660644697456, "sequenceId": 1 }, { "methodCall": "lifecycle.onInactive", "params": { "listen": true }, "timestamp": 1660644697795, "sequenceId": 2, "response": { "result": { "listening": true, "event": "lifecycle.onInactive" }, "timestamp": 1660644697796 } }]});
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});

test('verify updateCallWithResponse is working', () => {
  sessionManagement.addCall("testing", {});
  const result = sessionManagement.updateCallWithResponse("testing", "testing_session", "result")
  expect(result).toBeUndefined();
})