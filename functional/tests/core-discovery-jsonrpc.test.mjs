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

jest.setTimeout(20030);

beforeAll(async () => {
  const response = await utilities.mfState(
    true,
    ` -- --discovery`
  );
  expect(response).toBe("MF started successfully");
});

afterAll(async () => {
  //Stop Mock Firebolt
  const response = await utilities.killPort(9998);
  expect(response).toBe("Port Killed");
});

test(`Validate firebolt response for Discovery SDK`, async () => {
  const response = await utilities.fireboltCommand(
    JSON.stringify({
      method: "content.providers",
      params: {},
      id: 0,
    })
  );
  expect(response.includes(`"id":"NetflixApp"`)).toEqual(true);
});
