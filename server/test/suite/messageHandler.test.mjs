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
  await messageHandler.handleMessage('{"method": "device.version"}', "12345", {
    send: () => {},
  });
  expect(spy).toHaveBeenCalled();
});

test(`messageHandler.handleMessage works properly message param is true`, async () => {
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
    },
  };

  methodTriggers["rpc.discover"] = {
    pre: {
      call: () => {},
    },
    post: {
      call: () => {},
    },
  };

  const dummyMsgOne =
    '{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}';
  const resultOne = await messageHandler.handleMessage(dummyMsgOne, "12345", {
    send: () => {},
  });
  expect(resultOne).toBeUndefined();
});

test(`messageHandler.handleMessage works properly for logger.info`, async () => {
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
    },
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
  const dummyMsgTwo =
    '{"jsonrpc":"2.0","method":"invalidMethod","params":{"listen":true},"id":1}';
  await messageHandler.handleMessage(dummyMsgTwo, "12345", { send: () => {} });
  expect(infoSpy).toHaveBeenCalled();
});

test(`messageHandler.handleMessage works properly, message param is false`, async () => {
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
    },
  };

  methodTriggers["rpc.discover"] = {
    pre: {
      call: () => {},
    },
    post: {
      call: () => {},
    },
  };

  const dummyMsgThree =
    '{"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":false},"id":1}';
  const resultThree = await messageHandler.handleMessage(
    dummyMsgThree,
    "12345",
    { send: () => {} }
  );
  expect(resultThree).toBeUndefined();
});

test(`messageHandler.handleMessage works properly, for logger.debug`, async () => {
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
    },
  };

  methodTriggers["rpc.discover"] = {
    pre: {
      call: () => {},
    },
    post: {
      call: () => {},
    },
  };

  const debugSpy = jest.spyOn(logger, "debug");
  const dummyMsgFour =
    '{"jsonrpc":"2.0","method":"rpc.discover","params":{"listen":true},"id":1}';
  await messageHandler.handleMessage(dummyMsgFour, "12345", { send: () => {} });
  expect(debugSpy).toHaveBeenCalled();
});

test(`messageHandler.handleMessage works properly for error scenarios`, async () => {
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
    },
  };

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

test(`messageHandler.handleMessage works properly for developerNotes`, async () => {
  fireboltOpenRpc.testExports.methodMaps["core"] = {
    "account.id": {
      name: "account.id",
      summary: "Get the platform back-office account identifier",
      params: [],
      tags: [
        {
          name: "developerNotes",
          "x-notes": "test notes",
          "x-doc-url": "test url",
        },
      ],
      result: {
        name: "id",
      },
    },
  };
  const spy = jest.spyOn(logger, "warning");
  const dummyMsgSix =
    '{"jsonrpc":"2.0","method":"account.id","params":{"listen":true},"id":1}';
  const resultFour = await messageHandler.handleMessage(dummyMsgSix, "12345", {
    send: () => {},
  });
  expect(spy).toHaveBeenCalled();
  expect(resultFour).toBeUndefined();
});

test(`messageHandler.fSuccess works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  messageHandler.testExports.fSuccess("", "", { id: "1" });
  expect(spy).toHaveBeenCalled();
});

test(`messageHandler.fErr works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  messageHandler.testExports.fErr("");
  expect(spy).toHaveBeenCalled();
});

test(`messageHandler.fFatalErr works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  messageHandler.testExports.fFatalErr();
  expect(spy).toHaveBeenCalled();
});
