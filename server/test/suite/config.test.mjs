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
      caseInsensitiveModules: true,
      socketPort: 9998,
      httpPort: 3333,
      wsSessionServerPort: 9999,
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
      supportedOpenRPCs: [
        {
          cliFlag: null,
          cliShortFlag: null,
          enabled: true,
          url_Note: "Can be changed to test different versions of the firebolt-open-rpc",
          url: "https://rdkcentral.github.io/firebolt/requirements/latest/specifications/firebolt-open-rpc.json",
          name: "core",
        },
        {
          name: "mock",
          cliFlag: "mock",
          cliShortFlag: "m",
          fileName: "../../functional/mockOpenRpc.json",
          enabled: false
        }
      ],
      supportedToAppOpenRPCs: [
        {
          cliFlag: null,
          cliShortFlag: null,
          enabled: true,
          url_Note: "URL for toApp OpenRPC (Firebolt 2.0 event/provider spec)",
          fileName: "../firebolt-app-open-rpc.json",
          name: "coreToApp",
        },
        {
          name: "mockToApp",
          cliFlag: "mockToApp",
          cliShortFlag: "mt",
          fileName: "../../functional/mockToAppOpenRpc.json",
          enabled: false
        }
      ],
      bidirectional: true,
      eventConfig: {
        registrationMessage: {
          searchRegex: "(?=.*\\\"method\\\".*)(?=.*\\\"listen\\\":true.*).*\\.on\\S*",
          method: "$.method"
        },
        unRegistrationMessage: {
          searchRegex: "(?=.*\\\"method\\\".*)(?=.*\\\"listen\\\":false.*).*\\.on\\S*",
          method: "$.method"
        },
        registrationAck: "{\"jsonrpc\":\"2.0\",\"id\":{{registration.id}},\"result\":{\"listening\":true,\"event\":\"{{method}}\"}}",
        unRegistrationAck: "{\"jsonrpc\":\"2.0\",\"id\":{{unRegistration.id}},\"result\":{\"listening\":false,\"event\":\"{{method}}\"}}",
        event: "{\"result\":{{{resultAsJson}}},\"id\":{{registration.id}},\"jsonrpc\":\"2.0\"}",
        eventType: "Firebolt"
      }
    },
  };
  expect(config).toEqual(expectedResult);
});
