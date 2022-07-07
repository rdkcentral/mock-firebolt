"use script";
import fs from "fs";
import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as sessionManagement from "../../src/sessionManagement.mjs";

test("sessionManagement.stopRecording is working properly in case of throwing error", () => {
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

describe("Session", () => {
  const session = new sessionManagement.Session();

  test("should return null", () => {
    const result = session.exportSession();
    expect(result).toBe(null);
  });
  test("should return filepath", () => {
    const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    const result = session.exportSession();
    expect(spy).toHaveBeenCalled();
    expect(result).toMatch(/(sessions)/);
    spy.mockClear();
  });
});

describe("FireboltCall", () => {
  const fireboltCall = new sessionManagement.FireboltCall(
    "Test Method",
    "Test Parameters"
  );
  test("should instantiate", () => {
    expect(fireboltCall.methodCall).toEqual("Test Method");
  });
});

test("sessionManagement.startRecording is working properly", () => {
  const spy = jest.spyOn(logger, "info");
  sessionManagement.startRecording();
  expect(spy).toHaveBeenCalled();
});

test("sessionManagement.stopRecording is working properly for file condition", () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toMatch(/(sessions)/);
});

test("sessionManagement.stopRecording is working properly for else path", () => {
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

test("sessionManagement.isRecording is working properly", () => {
  if (true) {
    sessionManagement.startRecording();
    const result = sessionManagement.isRecording();
    expect(result).toBeTruthy();
    sessionManagement.stopRecording();
  }
  const result = sessionManagement.isRecording();
  expect(result).toBeFalsy();
});


test('should first', () => { 
    sessionManagement.startRecording();
    const result=sessionManagement.addCall("methodName","Parameters");
    expect(result).toBeUndefined();
 })
