"use strict";
import { jest } from "@jest/globals";
import { result } from "lodash-es";
import * as stateManagement from "../../src/stateManagement.mjs";

//jest.mock('stateManagement');

test("addUser working properly", () => {
  const userId = 12345;
  expect(stateManagement.addUser(userId)).toBeUndefined();
});
test("getState working properly", () => {
  const result = stateManagement.getState(12345);
  const expectedResult = {
    global: { latency: { max: 0, min: 0 }, mode: "DEFAULT" },
    methods: {},
    scratch: {},
    sequenceState: {},
  };
  expect(result).toEqual(expectedResult);
});

test("getAppropriateDelay is working properly", async () => {
  const result = await stateManagement.getAppropriateDelay(
    12345,
    "accessibility.closedCaptions"
  );
  expect(result).toBe(0);
});

test("getMethodResponse working properly", () => {
  const dumyParams = [];
  const expectedResult = {};
  const result = stateManagement.getMethodResponse(
    "12345",
    "accessibility.closedCaptions",
    dumyParams
  );
  expect(result).toEqual(expectedResult);
});

test("stateManagement.updateState working properly", () => {
  const userId = 12345;
  const newState = {
    global: {
      latency: {
        min: 3000,
        max: 3000,
      },
    },
  };
  expect(stateManagement.updateState(userId, newState)).toBeUndefined();
});

test("stateManagement.revertState working properly", () => {
  const userId = 12345;
  expect(stateManagement.revertState(userId)).toBeUndefined();
});

test("stateManagement.setLatency working properly", () => {
  const userId = 12345,
    min = 3000,
    max = 3000;
  expect(stateManagement.setLatency(userId, min, max)).toBeUndefined();
});

test("stateManagement.setLatencies working properly", () => {
  const dumyoLatency = {
    min: 0,
    max: 0,
    device: { type: { min: 3000, max: 3000 } },
  };
  const userId = 12345;
  expect(stateManagement.setLatencies(userId, dumyoLatency)).toBeUndefined();
});

test("stateManagement.isLegalMode is working properly", () => {
  const dumyMode = ["default", "box", "xyz"];
  dumyMode.forEach((modes) => {
    const result = stateManagement.isLegalMode(modes);
    if (modes === "xyz") expect(result).toBeFalsy();
    else expect(result).toBeTruthy();
  });
});

test("stateManagement.setMode is working properly", () => {
  const userId = 12345,
    mode = "box";
  expect(stateManagement.setMode(userId, mode)).toBeUndefined();
});

test("stateManagement.setMethodError is woring properly ", () => {
  const userId = 12345,
    methodName = "accessibility.closedCaptionsSettings";
  const error = {
    code: -32601,
    message: "Not supported",
  };
  expect(
    stateManagement.setMethodError(
      userId,
      methodName,
      error.code,
      error.message
    )
  ).toBeUndefined();
});

test("stateManagement.setScratch is working properly", () => {
  const key = "closedCaptionsSettings",
    userId = 12345;
  const value = {
    enabled: true,
    styles: {
      fontFamily: "Monospace sans-serif",
      fontSize: 1,
      fontColor: "#ffffff",
      fontEdge: "none",
      fontEdgeColor: "#7F7F7F",
      fontOpacity: 100,
      backgroundColor: "#000000",
      backgroundOpacity: 100,
      textAlign: "center",
      textAlignVertical: "middle",
    },
  };
  expect(stateManagement.setScratch(userId, key, value)).toBeUndefined();
});

test("stateManagement.getScratch is working properly", () => {
  const userId = 12345;
  const keysArray = ["closedCaptionsSettings", "abc"];
  const expectedResult = {
    enabled: true,
    styles: {
      backgroundColor: "#000000",
      backgroundOpacity: 100,
      fontColor: "#ffffff",
      fontEdge: "none",
      fontEdgeColor: "#7F7F7F",
      fontFamily: "Monospace sans-serif",
      fontOpacity: 100,
      fontSize: 1,
      textAlign: "center",
      textAlignVertical: "middle",
    },
  };
  keysArray.forEach((key) => {
    const result = stateManagement.getScratch(userId, key);
    if (key === "abc") {
      expect(result).toBeUndefined();
    } else {
      expect(result).toEqual(expectedResult);
    }
  });
});
//setMethodResult not working
