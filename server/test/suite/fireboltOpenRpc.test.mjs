"use strict";
import { jest } from "@jest/globals";
import * as fireboltOpenRpc from "../../src/fireboltOpenRpc.mjs";

test("fireboltOpenRpc.getRawMeta working properly", () => {
  const expectedResult = {};
  const result = fireboltOpenRpc.getRawMeta();
  expect(result).toEqual(expectedResult);
});

test("fireboltOpenRpc.getMeta working properly", () => {
  const expectedResult = {};
  const result = fireboltOpenRpc.getMeta();
  expect(result).toEqual(expectedResult);
});

test("fireboltOpenRpc.getMethod working only for undefined", () => {
  // because of empty method map we are not able to test if path

  const result = fireboltOpenRpc.getMethod("authentication.token");
  expect(result).toBeUndefined();
});

test("fireboltOpenRpc.isMethodKnown working only for undefined", () => {
  // because of empty method map we are not able to test if path
  const result = fireboltOpenRpc.isMethodKnown("authentication.token");
  expect(result).toBeFalsy();
});

test("fireboltOpenRpc.validateMethodError is working properly", () => {
  const arr = [
    { val: "function(){12334}", result: 0 },
    { val: { message: "Not supported" }, result: 1 },
    { val: { code:  -32601 }, result: 1 },
    { val: 12345, result: 1 },
    { val: { code: -32601,message: "Not supported" }, result: 0 },
  ];
  arr.forEach((item) => {
    const result = fireboltOpenRpc.validateMethodError(item.val);
    expect(result.length).toBe(item.result);
  });
});
