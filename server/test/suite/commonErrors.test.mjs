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

// commonErrors: Tests

"use strict";

import * as commonErrors from "../../src/commonErrors.mjs";

describe(`FireboltError works properly`, () => {
  const fireboltError = new commonErrors.FireboltError("code", "message");
  test("should instantiate", () => {
    expect(fireboltError.code).toEqual("code");
  });
});

describe(`DataValidationError works properly`, () => {
  const dataValidationError = new commonErrors.DataValidationError("errors");
  test("should instantiate", () => {
    expect(dataValidationError.errors).toEqual("errors");
  });
});
