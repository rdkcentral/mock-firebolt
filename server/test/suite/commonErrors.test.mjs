"use strict";
import * as commonErrors from "../../src/commonErrors.mjs";

describe("FireboltError", () => {
  const fireboltError = new commonErrors.FireboltError("code", "message");
  test("should instantiate", () => {
    expect(fireboltError.code).toEqual("code");
  });
});

describe("DataValidationError", () => {
  const dataValidationError = new commonErrors.DataValidationError("errors");
  test("should instantiate", () => {
    expect(dataValidationError.errors).toEqual("errors");
  });
});
