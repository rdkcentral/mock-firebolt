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

// Message Handler: Tests

"use strict";

import { jest } from "@jest/globals";
import * as messageHandler from "../../src/messageHandler.mjs";
import { logger } from "../../src/logger.mjs";
import * as fireboltOpenRpc from "../../src/fireboltOpenRpc.mjs";
import { methodTriggers } from "../../src/triggers.mjs";

test(`messageHandler.handleMessage works properly and return when message doesn't have any id`, async () => {
  const spy = jest.spyOn(logger, "info");
  await messageHandler.handleMessage('{"test": "test msg"}', "12345", {
    send: () => {},
  });
  expect(spy).toHaveBeenCalled();
});

test(`messageHandler.handleMessage works properly`, async () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "lifecycle.onInactive": {
      name: "lifecycle.onInactive",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    },
    "rpc.discover": {
      name: "rpc.discover",
      summary: "Firebolt OpenRPC schema",
      params: [],
      result: {
        name: "OpenRPC Schema",
        schema: {
          type: "object",
        },
      },
    }
  };

  methodTriggers["rpc.discover"] = {
    pre: {
      call: () => {},
    },
    post: {
      call: () => {},
    },
  };

  const infoSpy = jest.spyOn(logger, "info");
  const dummyMsgOne =
    '{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}';
  const resultOne = await messageHandler.handleMessage(dummyMsgOne, "12345", {
    send: () => {},
  });
  expect(resultOne).toBeUndefined();

  const dummyMsgTwo =
    '{"jsonrpc":"2.0","method":"invalidMethod","params":{"listen":true},"id":1}';
  await messageHandler.handleMessage(dummyMsgTwo, "12345", { send: () => {} });
  expect(infoSpy).toHaveBeenCalled();

  const dummyMsgThree =
    '{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":false},"id":1}';
  const resultThree = await messageHandler.handleMessage(
    dummyMsgThree,
    "12345",
    { send: () => {} }
  );
  expect(resultThree).toBeUndefined();

  const debugSpy = jest.spyOn(logger, "debug");
  const dummyMsgFour =
    '{"jsonrpc":"2.0","method":"rpc.discover","params":{"listen":true},"id":1}';
  await messageHandler.handleMessage(dummyMsgFour, "12345", { send: () => {} });
  expect(debugSpy).toHaveBeenCalled();

  methodTriggers["rpc.discover"] = {
    pre: {},
    post: {},
  };
  const errorSpy = jest.spyOn(logger, "error");
  const dummyMsgFive =
    '{"jsonrpc":"2.0","method":"rpc.discover","params":{"listen":true},"id":1}';
  await messageHandler.handleMessage(dummyMsgFive, "12345", { send: () => {} });
  expect(errorSpy).toHaveBeenCalled();
});
