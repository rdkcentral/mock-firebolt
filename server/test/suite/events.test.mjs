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
  const metadata = {
    registration: {},
    unRegistration: {}
  };
  const dummyWebSocket = { send: () => {} };
  events.registerEventListener("12345", metadata, dummyWebSocket);
  expect(spy).toHaveBeenCalled();
});

test(`events.isRegisteredEventListener works properly`, () => {
  const methodArray = ["lifecycle.onInactive", "ASCDFG"];
  const dummyObject = {
    method: "lifecycle.onInactive",
    registration: { id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  methodArray.forEach((method) => {
    const result = events.testExports.isRegisteredEventListener(
      "12345",
      method
    );
    const expectedResult = (method === dummyObject.method);
    expect(result).toBe(expectedResult);
  });
});

test(`events.isRegisteredEventListener works properly if path`, () => {
  const dummyObject = {
    method: "lifecycle.onInactive",
    registration: { id: 12 },
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.isRegisteredEventListener(
    "12345",
    "lifecycle.onInactive"
  );
  expect(result).toBeTruthy();
});

test(`events.getRegisteredEventListener works properly`, () => {
  const methodName = "lifecycle.onInactive";
  const dummyObject = {
    registration: { id: 12 },
    method: methodName
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.getRegisteredEventListener(
    "12345",
    methodName
  );
  const expectedResult = {
    metadata: {
      method: methodName,
      registration: { id: 12 },
    },
    wsArr: [],
  };
  expect(result).toEqual(expectedResult);
});

test(`events.getRegisteredEventListener works properly if path`, () => {
  const methodName = "lifecycle.onInactive";
  const dummyObject = {
    registration: { id: 12 },
    method: methodName
  };
  events.registerEventListener("12345", dummyObject);
  const result = events.testExports.getRegisteredEventListener(
    "12342",
    methodName
  );
  expect(result).toBeFalsy();
});

test(`events.deregisterEventListener works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const metadata = { 
    registration: {},
    method: "lifecycle.onInactive", 
    unRegistration: {}
  };
  const dummyWebSocket = { send: () => {} };
  events.deregisterEventListener("12345", metadata, dummyWebSocket);
  expect(spy).toHaveBeenCalled();
});

test(`events.isEventListenerOnMessage works properly`, () => {
  const input = [
    {
      jsonrpc: '2.0',
      method: 'lifecycle.onInactive',
      params: { listen: true }
    },
    {
      jsonrpc: '2.0',
      method: 'lifecycle.Inactive',
      params: { listen: true }
    },
    {
      jsonrpc: '2.0',
      method: 'lifecycle.onInactive',
      params: { listen: false }
    },
    {
      jsonrpc: '2.0',
      method: 'lifecycle.Inactive',
      params: { listen: false }
    }
  ];

  const expectedOutput = [true, false, false, false];

  input.forEach((obj, i) => {
    const result = events.isEventListenerOnMessage(obj);
    expect(result).toBe(expectedOutput[i]);
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

  const expectedOutput = [false, false, true, false];

  dummyArray.forEach((obj, i) => {
    const result = events.isEventListenerOffMessage(obj);
    expect(result).toBe(expectedOutput[i]);
  });
});

test(`events.sendEventListenerAck works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const wsSpy = jest.fn();
  const dummyWebSocket = { send: wsSpy };
  const metadataDummy = { 
    method: "lifecycle.onInactive", 
    registration: { id: 12 } 
  };
  events.sendEventListenerAck("12345", dummyWebSocket, metadataDummy);
  expect(spy).toHaveBeenCalled();
  expect(wsSpy).toHaveBeenCalled();
});

test(`events.sendUnRegistrationAck works properly`, () => {
  const spy = jest.spyOn(logger, "debug");
  const wsSpy = jest.fn();
  const dummyWebSocket = { send: wsSpy };
  const metadataDummy = { 
    method: "lifecycle.onInactive", 
    unRegistration: { id: 12 } 
  };
  events.sendUnRegistrationAck("12345", dummyWebSocket, metadataDummy);
  expect(spy).toHaveBeenCalled();
  expect(wsSpy).toHaveBeenCalled();
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
  const dummyObject = {
    registration: { id: 12 },
    method: methodName
  };
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
  // Register a dummy event listener for user "12345"
  const dummyObject = {
    method: "dummyMethod",
    registration: { id: 1 },
    unRegistration: {}
  };
  events.registerEventListener("12345", dummyObject);

  // Check if there is any registered event listener for user "12345", regardless of the method
  const result = events.testExports.isAnyRegisteredInGroup("12345", "dummyMethod");
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
  const dummyObject = {
    registration: { id: 12 },
    method: 'methodName'
  };
  const dummyWebSocket = { send: () => {} };

  // Register the event listener first to simulate a real-world scenario
  events.registerEventListener("12345", dummyObject, dummyWebSocket);

  events.testExports.emitResponse({}, "test_msg", "12345", "methodName");
  expect(spy).toHaveBeenCalled();
});

test(`events.extractEventData returns correct data when searchRegex and method match`, () => {
  const oMsg = {
    method: 'lifecycle.onInactive',
    payload: {
      userId: 123,
    },
  };
  const config = {
    searchRegex: /lifecycle\..*/,
    method: '$.method',
  };
  const isEnabled = true;

  const result = events.extractEventData(oMsg, config, isEnabled);

  const expectedResult = {
    registration: oMsg,
    method: 'lifecycle.onInactive',
    unRegistration: {},
  };
  expect(result).toEqual(expectedResult);
});

test(`events.extractEventData returns correct data when searchRegex and method match 2`, () => {
  const oMsg = {
    payload: {
      userId: 123,
      params: {
        method: 'lifecycle.onInactive',
      }
    },
  };
  const config = {
    searchRegex: /lifecycle\..*/,
    method: 'payload.params.method',
  };
  const isEnabled = true;

  const result = events.extractEventData(oMsg, config, isEnabled);

  const expectedResult = {
    registration: oMsg,
    method: 'lifecycle.onInactive',
    unRegistration: {},
  };
  expect(result).toEqual(expectedResult);
});

test(`events.extractEventData returns false when searchRegex does not match`, () => {
  const oMsg = {
    method: 'lifecycle.onInactive',
    payload: {
      userId: 123,
    },
  };
  const config = {
    searchRegex: /invalidRegex/,
    method: '$.method',
  };
  const isEnabled = true;

  const result = events.extractEventData(oMsg, config, isEnabled);

  expect(result).toBeFalsy();
});

test(`events.extractEventData returns false when method does not match`, () => {
  const oMsg = {
    method: 'lifecycle.onInactive',
    payload: {
      userId: 123,
    },
  };
  const config = {
    searchRegex: /lifecycle\..*/,
    method: '$.nonExistentProperty',
  };
  const isEnabled = true;

  const result = events.extractEventData(oMsg, config, isEnabled);

  expect(result).toBeFalsy();
});

test(`events.extractEventData returns correct data when isEnabled is false`, () => {
  const oMsg = {
    method: 'lifecycle.onInactive',
    payload: {
      userId: 123,
    },
  };
  const config = {
    searchRegex: /lifecycle\..*/,
    method: '$.method',
  };
  const isEnabled = false;

  const result = events.extractEventData(oMsg, config, isEnabled);

  const expectedResult = {
    registration: {},
    method: 'lifecycle.onInactive',
    unRegistration: oMsg,
  };
  expect(result).toEqual(expectedResult);
});
