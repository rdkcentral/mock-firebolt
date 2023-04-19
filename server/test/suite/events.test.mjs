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

// events: Tests

"use strict";

import { jest } from "@jest/globals";
import * as events from "../../src/events.mjs";
import { logger } from "../../src/logger.mjs";
import { eventTriggers } from "../../src/triggers.mjs";

test(`events.registerEventListener works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const dummyObject = {
    method: "",
    id: 12,
  };
  const dummyWebSocket = { send: () => {} };
  events.registerEventListener("12345", dummyObject, dummyWebSocket);
  expect(spy).toHaveBeenCalled();
});

test(`events.isRegisteredEventListener works properly`, () => {
  const methodArray = ["lifecycle.onInactive", "ASCDFG"];
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  methodArray.forEach((method) => {
    const result = events.testExports.isRegisteredEventListener(
      "12345",
      method
    );
    if (method in Object.keys(dummyObject)) expect(result).toBeTruthy();
    else expect(result).toBeFalsy();
  });
});

test(`events.isRegisteredEventListener works properly if path`, () => {
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.isRegisteredEventListener(
    "12342",
    "lifecycle.onInactive"
  );
  expect(result).toBeFalsy();
});

test(`events.getRegisteredEventListener works properly`, () => {
  const methodName = "lifecycle.onInactive";
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.getRegisteredEventListener(
    "12345",
    methodName
  );
  const expectedResult = dummyObject.methodName;
  expect(result).toEqual(expectedResult);
});

test(`events.getRegisteredEventListener works properly if path`, () => {
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.getRegisteredEventListener(
    "12342",
    "lifecycle.onInactive"
  );
  expect(result).toBeFalsy();
});

test(`events.deregisterEventListener works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgdummy = { method: "lifecycle.onInactive", id: 12 };
  const dummyWebSocket = { send: () => {} };
  events.deregisterEventListener("12345", oMsgdummy.method, dummyWebSocket);
  expect(spy).toHaveBeenCalled();
});

test(`events.isEventListenerOnMessage works properly`, () => {
  const dummyArray = [
    {
      jsonrpc: "2.0",
      method: "lifecycle.onInactive",
      params: { listen: true },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.Inactive",
      params: { listen: true },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.onInactive",
      params: { listen: false },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.Inactive",
      params: { listen: false },
      id: 1,
    },
  ];

  dummyArray.forEach((dummyExample) => {
    const result = events.isEventListenerOnMessage(dummyExample);
    const methodName = dummyExample.method.substring(
      dummyExample.method.lastIndexOf(".") + 1
    );
    const expectedResult =
      dummyExample.params.listen && methodName.startsWith("on");
    expect(result).toBe(expectedResult);
  });
});

test(`events.isEventListenerOffMessage works properly`, () => {
  const dummyArray = [
    {
      jsonrpc: "2.0",
      method: "lifecycle.onInactive",
      params: { listen: true },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.Inactive",
      params: { listen: true },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.onInactive",
      params: { listen: false },
      id: 1,
    },
    {
      jsonrpc: "2.0",
      method: "lifecycle.Inactive",
      params: { listen: false },
      id: 1,
    },
  ];

  dummyArray.forEach((dummyExample) => {
    const result = events.isEventListenerOffMessage(dummyExample);
    const methodName = dummyExample.method.substring(
      dummyExample.method.lastIndexOf(".") + 1
    );
    const expectedResult =
      !dummyExample.params.listen && methodName.startsWith("on");
    expect(result).toBe(expectedResult);
  });
});

test(`events.sendEventListenerAck works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgdummy = { method: "lifecycle.onInactive", id: 12 };
  const dummyWebSocket = { send: () => {} };
  events.sendEventListenerAck("12345", dummyWebSocket, oMsgdummy);
  expect(spy).toHaveBeenCalled();
});

test(`events.sendEvent works properly`, () => {
  const methodName = "test",
    result = {
      name: "OpenRPC Schema",
      schema: {
        type: "object",
      },
    },
    testMsg = "xvbx",
    fErr = { call: () => {} },
    fSuccess = { call: () => {} },
    fFatalErr = { call: () => {} };
  const debugSpy = jest.spyOn(logger, "debug");
  const infoSpy = jest.spyOn(logger, "info");
  const errorSpy = jest.spyOn(logger, "error");
  const dummyObject = { method: "test", id: 12 };
  eventTriggers.test = {
    pre: {
      call: () => {},
    },
    post: {
      call: () => {},
    },
  };
  const dummyWebSocket = { send: () => {} };

  events.registerEventListener("12345", dummyObject, dummyWebSocket);
  events.sendEvent(
    dummyWebSocket,
    "12345",
    methodName,
    result,
    testMsg,
    fSuccess,
    fErr,
    fFatalErr
  );
  expect(debugSpy).toHaveBeenCalled();
  events.sendEvent(
    { send: () => {} },
    "12345",
    "unregisteredMethod",
    result,
    testMsg,
    fSuccess,
    fErr,
    fFatalErr
  );
  expect(infoSpy).toHaveBeenCalled();
  eventTriggers.test = {};
  events.sendEvent(
    { send: () => {} },
    "12345",
    methodName,
    result,
    testMsg,
    {},
    fErr,
    fFatalErr
  );
  expect(errorSpy).toHaveBeenCalled();
  eventTriggers.test = {
    post: {},
    pre: {},
  };
  events.sendEvent(
    { send: () => {} },
    "12345",
    methodName,
    result,
    testMsg,
    {},
    fErr,
    fFatalErr
  );
  expect(errorSpy).toHaveBeenCalled();
});

test(`events.logSuccess works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  events.logSuccess("dummyMethod", { name: "test" }, "testMsg");
  expect(spy).toHaveBeenCalled();
});

test(`events.logErr works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  events.logErr("dummyMethod");
  expect(spy).toHaveBeenCalled();
});

test(`events.logFatalErr works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  events.logFatalErr();
  expect(spy).toHaveBeenCalled();
});

test(`events.isAnyRegisteredInGroup works properly`, () => {
  const result = events.testExports.isAnyRegisteredInGroup("12345", "core");
  expect(result).toBe(false);
});

test(`events.isAnyRegisteredInGroup works properly with if path`, () => {
  const result = events.testExports.isAnyRegisteredInGroup("12345", "");
  expect(result).toBe(true);
});

test(`events.sendBroadcastEvent works properly`, () => {
  const dummyWebSocket = { send: () => {} };
  const result = events.testExports.sendBroadcastEvent(
    dummyWebSocket,
    "12345",
    "core",
    {},
    "test_msg",
    () => {},
    () => {},
    () => {}
  );
  expect(result).toBeUndefined();
});

test(`events.emitResponse works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  const listenerObject = {
    method: "core",
    id: 12,
  };
  const dummyWebSocket = { send: () => {} };

  // Register the event listener first to simulate a real-world scenario
  events.registerEventListener("12345", listenerObject, dummyWebSocket);

  events.testExports.emitResponse({}, "test_msg", "12345", "core");
  expect(spy).toHaveBeenCalled();
});
