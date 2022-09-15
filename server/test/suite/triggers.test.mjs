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

// Triggers: Tests

"use strict";

import path from "path";
import { jest } from "@jest/globals";
import * as triggers from "../../src/triggers.mjs";
import { logger } from "../../src/logger.mjs";

const __dirname = path.resolve();
const filePath = path.resolve(
  __dirname,
  "src",
  "triggers",
  "eventTriggers",
  "device.onDeviceNameChanged",
  "pre.mjs"
);
const dirPath = path.resolve(
  __dirname,
  "src",
  "triggers",
  "eventTriggers",
  "device.onDeviceNameChanged"
);
const testPath = path.resolve(__dirname, "src", "triggers", "methodTriggers");

jest.setTimeout(30000);

test(`triggers.processFile works properly`, async () => {
  await new Promise((r) => {
    triggers.testExports.processFile(
      "closedcaptions.enabled",
      filePath,
      "pre",
      ".mjs"
    );
    setTimeout(r, 1000);
    expect(JSON.stringify(triggers.eventTriggers)).toBe("{}");
  });
});

test(`triggers.processFile works properly`, async () => {
  await new Promise((r) => {
    triggers.testExports.processFile(
      "device.onDeviceNameChanged",
      filePath,
      "pre",
      ".mjs"
    );
    setTimeout(r, 2000);
    expect(JSON.stringify(triggers.eventTriggers)).toBe("{}");
  });
});

test(`triggers.processFile works properly`, async () => {
  await new Promise((r) => {
    const infoSpy = jest.spyOn(logger, "info");
    triggers.testExports.processFile(
      "rpc.discover",
      filePath,
      "testName",
      ".mjs"
    );
    setTimeout(r, 1000);
    expect(infoSpy).toHaveBeenCalled();
  });
});

test(`triggers.processMethodDir works properly`, async () => {
  await new Promise((r) => {
    triggers.testExports.processMethodDir(
      dirPath,
      "rpc.discover",
      triggers.testExports.processFile
    );
    setTimeout(r, 1000);
    expect(JSON.stringify(triggers.eventTriggers)).toBe(
      '{"device.onDeviceNameChanged":{}}'
    );
  });
});

test(`triggers.processTopDir works properly`, async () => {
  await new Promise((r) => {
    triggers.testExports.processTopDir(
      dirPath,
      triggers.testExports.processMethodDir
    );
    setTimeout(r, 1000);
    expect(JSON.stringify(triggers.eventTriggers)).toBe(
      '{"device.onDeviceNameChanged":{}}'
    );
  });
});

test(`triggers.processSubDir works properly`, async () => {
  await new Promise((r) => {
    triggers.testExports.processSubDir(
      testPath,
      triggers.testExports.processTopDir
    );
    setTimeout(r, 1000);
    expect(JSON.stringify(triggers.eventTriggers)).toBe(
      '{"device.onDeviceNameChanged":{}}'
    );
  });
});

test(`triggers.logInvalidPathError works properly`, () => {
  const testInputs = [
    {
      errorType: "eventTriggerError",
      dummyErrorString: "This is the 1st error",
      dummyPath: "Test_Path1",
    },
    {
      errorType: "methodTriggerError",
      dummyErrorString: "This is the 2nd error",
      dummyPath: "Test_Path2",
    },
    {
      errorType: "processSubDirError",
      dummyErrorString: "This is the 3rd error",
      dummyPath: "Test_Path3",
    },
    {
      errorType: "",
      dummyErrorString: "This is the 4th error",
      dummyPath: "Test_Path4",
    },
  ];
  const spy = jest.spyOn(logger, "error");
  testInputs.forEach(({ errorType, dummyPath, dummyErrorString }) => {
    triggers.testExports.logInvalidPathError(errorType, dummyPath, dummyErrorString);
    expect(spy).toHaveBeenCalled();
  });
});
