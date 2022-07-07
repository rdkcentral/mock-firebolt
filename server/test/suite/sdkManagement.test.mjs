"use strict";
import * as sdkManagement from "../../src/sdkManagement.mjs";

test("should first", () => {
  const dumyArray = [
    { in: "core", output: true },
    { in: "manage", output: false },
    { in: "newSdk ", output: false },
  ];
  dumyArray.forEach((sdk) => {
    const result = sdkManagement.isSdkEnabled(sdk.in);
    expect(result).toBe(sdk.output);
  });
});
