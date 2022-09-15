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

// dotConfig: Tests

"use strict";

import path from "path";
import { jest } from "@jest/globals";
import { dotConfig, testExports } from "../../src/dotConfig.mjs";
import { logger } from "../../src/logger.mjs";

test(`dotConfig works properly`, () => {
  const result = JSON.parse(JSON.stringify(dotConfig));
  expect(result).not.toBeUndefined();
});

test(`dotConfig.handleError works properly`, () => {
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
  const spy = jest.spyOn(logger, 'error');
  testExports.handleError(filePath, dirPath);
  expect(spy).toHaveBeenCalled();
});
