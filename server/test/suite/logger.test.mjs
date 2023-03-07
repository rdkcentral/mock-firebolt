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

// logger: Tests

"use strict";

import { logger } from "../../src/logger.mjs";
import { jest } from "@jest/globals";

test(`logger works properly`, () => {
  const spy = jest.spyOn(console, "log");
  logger.importantWarning("test important warning");
  logger.debug("testDebug");
  logger.err("test err");
  logger.error("test error");
  logger.important("test important");
  logger.info("test info");
  logger.warn("test warn");
  logger.warning("test warning");
  expect(spy).toHaveBeenCalledTimes(8);
});
