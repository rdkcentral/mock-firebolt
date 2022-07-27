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

import { dotConfig } from "../../src/dotConfig.mjs";

test(`dotConfig works properly`, () => {
  const expectedResult = {
    supportedSdks: [
      {
        cliFlag: null,
        cliShortFlag: null,
        enabled: true,
        fileName: "firebolt-open-rpc.json",
        name: "core",
      },
      {
        cliFlag: "manage",
        cliShortFlag: "m",
        enabled: false,
        fileName: "firebolt-manage-open-rpc.json",
        name: "manage",
      },
      {
        cliFlag: "discovery",
        cliShortFlag: "d",
        enabled: false,
        fileName: "firebolt-discovery-open-rpc.json",
        name: "discovery",
      },
    ],
    validateMethodOverrides: true,
  };
  expect(dotConfig).toEqual(expectedResult);
});
