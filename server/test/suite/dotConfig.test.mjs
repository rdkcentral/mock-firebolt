"use strict";
import { dotConfig } from "../../src/dotConfig.mjs";

test("dotConfig working properly", () => {
  const expectedResult = {
    supportedSdks: [
      {
        cliFlag: null,
        cliShortFlag: null,
        enabled: true,
        fileName: "firebolt-open-rpc.json",
        name: "core",
      },
      {
        cliFlag: "manage",
        cliShortFlag: "m",
        enabled: false,
        fileName: "firebolt-manage-open-rpc.json",
        name: "manage",
      },
      {
        cliFlag: "discovery",
        cliShortFlag: "d",
        enabled: false,
        fileName: "firebolt-discovery-open-rpc.json",
        name: "discovery",
      },
    ],
  };
  expect(dotConfig).toEqual(expectedResult);
});
