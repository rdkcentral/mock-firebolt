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

// Developer Tools: Tests

'use strict';

import { jest } from "@jest/globals"
import * as triggers from "../../src/triggers.mjs";
import { logger } from "../../src/logger.mjs";

test(`triggers.processFile works properly`, () => {
  const infoSpy = jest.spyOn(logger, 'info');
  triggers.testExports.processFile('rpc.discover', 'test-path', 'testName', '.js');
  expect(infoSpy).toHaveBeenCalled();
});
