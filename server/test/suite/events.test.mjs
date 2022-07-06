"use strict";

import { jest } from "@jest/globals";
import * as events from "../../src/events.mjs";
import { logger } from "../../src/logger.mjs";

test("events.registerEventListener is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const dumyObject = {
    method: "",
    id: 12,
  };
  events.registerEventListener(dumyObject);
  expect(spy).toHaveBeenCalled();
});

test("events.isRegisteredEventListener is working properly", () => {
  const methodArray = ["lifecycle.onInactive", "ASCDFG"];
  const dumyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener(dumyObject);
  methodArray.forEach((method) => {
    const result = events.isRegisteredEventListener(method);
    if (method in Object.keys(dumyObject)) expect(result).toBeTruthy();
    else expect(result).toBeFalsy();
  });
});

test("events.getRegisteredEventListener is working properly", () => {
  const methodName = "lifecycle.onInactive";
  const dumyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener(dumyObject);
  const result = events.getRegisteredEventListener(methodName);
  const expectedResult = dumyObject.methodName;
  expect(result).toEqual(expectedResult);
});

test("events.deregisterEventListener is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgDumy = { method: "lifecycle.onInactive", id: 12 };
  events.deregisterEventListener(oMsgDumy);
  expect(spy).toHaveBeenCalled();
});

test("events.isEventListenerOnMessage is working properly", () => {
  const dumyArray = [
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

  dumyArray.forEach((dumyExample) => {
    const result = events.isEventListenerOnMessage(dumyExample);
    const methodName = dumyExample.method.substring(
      dumyExample.method.lastIndexOf(".") + 1
    );
    const expectedResult =
      dumyExample.params.listen && methodName.startsWith("on");
    expect(result).toBe(expectedResult);
  });
});
test("events.isEventListenerOffMessage is working properly", () => {
  const dumyArray = [
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

  dumyArray.forEach((dumyExample) => {
    const result = events.isEventListenerOffMessage(dumyExample);
    const methodName = dumyExample.method.substring(
      dumyExample.method.lastIndexOf(".") + 1
    );
    const expectedResult =
      !dumyExample.params.listen && methodName.startsWith("on");
    expect(result).toBe(expectedResult);
  });
});

test("events.sendEventListenerAck is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgDumy = { method: "lifecycle.onInactive", id: 12 };
  events.sendEventListenerAck({ send: () => {} }, oMsgDumy);
  expect(spy).toHaveBeenCalled();
});
