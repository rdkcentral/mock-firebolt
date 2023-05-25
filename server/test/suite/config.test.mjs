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

// configuration: Tests

"use strict";

import { config } from "../../src/config.mjs";

test(`config works properly`, () => {
  const expectedResult = {
    validate: ["method", "params", "response", "events"],
    multiUserConnections: "warn",
    app: {
      allowMixedCase: false,
      socketPort: 9998,
      httpPort: 3333,
      conduitSocketPort: 9997,
      conduitKeySocketPort: 9996,
      developerToolPort: 9995,
      developerToolName: 'Mock Firebolt',
      defaultUserId: '12345',
      magicDateTime: { prefix: '{{', suffix: '}}' },
      developerNotesTagName: 'developerNotes'
    },
    dotConfig: {
      validate: ["method", "params", "response", "events"],
      multiUserConnections: 'warn',
      supportedSdks: [
        {
          cliFlag: null,
          cliShortFlag: null,
          enabled: true,
          url: "https://meta.rdkcentral.com/firebolt/api/",
          name: "core",
        },
        {
          cliFlag: "discovery",
          cliShortFlag: "d",
          enabled: false,
          fileName: "firebolt-discovery-open-rpc.json",
          name: "discovery",
        },
      ],
    },
  };
  expect(config).toEqual(expectedResult);
});
