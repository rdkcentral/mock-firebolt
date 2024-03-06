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

// sdkManagement: Tests

"use strict";

import * as sdkManagement from "../../src/sdkManagement.mjs";
import * as commandLine from "../../src/commandLine.mjs";

test(`sdkManagement works properly`, () => {
  const dummyArray = [
    { in: "core", output: true },
    { in: "manage", output: false },
    { in: "newSdk ", output: false },
  ];
  dummyArray.forEach((sdk) => {
    const result = sdkManagement.isSdkEnabled(sdk.in);
    expect(result).toBe(sdk.output);
  });
});

test(`sdkManagement works properly with given name is enabled via a command-line flag`, () => {
  commandLine.enabledSdkNames.push("updatedSdk");
  const result = sdkManagement.isSdkEnabled("updatedSdk");
  expect(result).toBe(true);
  commandLine.enabledSdkNames.pop();
});
