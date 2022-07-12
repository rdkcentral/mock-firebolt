"use strict";

import { jest } from "@jest/globals";
import * as events from "../../src/events.mjs";
import { logger } from "../../src/logger.mjs";

test("events.registerEventListener is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const dummyObject = {
    method: "",
    id: 12,
  };
  events.registerEventListener(dummyObject);
  expect(spy).toHaveBeenCalled();
});

test("events.isRegisteredEventListener is working properly", () => {
  const methodArray = ["lifecycle.onInactive", "ASCDFG"];
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener(dummyObject);
  methodArray.forEach((method) => {
    const result = events.isRegisteredEventListener(method);
    if (method in Object.keys(dummyObject)) expect(result).toBeTruthy();
    else expect(result).toBeFalsy();
  });
});

test("events.getRegisteredEventListener is working properly", () => {
  const methodName = "lifecycle.onInactive";
  const dummyObject = {
    "lifecycle.onInactive": { method: "lifecycle.onInactive", id: 12 },
  };
  events.registerEventListener(dummyObject);
  const result = events.getRegisteredEventListener(methodName);
  const expectedResult = dummyObject.methodName;
  expect(result).toEqual(expectedResult);
});

test("events.deregisterEventListener is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgdummy = { method: "lifecycle.onInactive", id: 12 };
  events.deregisterEventListener(oMsgdummy);
  expect(spy).toHaveBeenCalled();
});

test("events.isEventListenerOnMessage is working properly", () => {
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
test("events.isEventListenerOffMessage is working properly", () => {
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

test("events.sendEventListenerAck is working properly", () => {
  const spy = jest.spyOn(logger, "debug");
  const oMsgdummy = { method: "lifecycle.onInactive", id: 12 };
  events.sendEventListenerAck({ send: () => {} }, oMsgdummy);
  expect(spy).toHaveBeenCalled();
});
