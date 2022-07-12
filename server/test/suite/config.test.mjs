"use strict";
import { config } from "../../src/config.mjs";

test("config working properly", () => {
  const expectedResult = {
    app: {
      allowMixedCase: false,
      socketPort: 9998,
      httpPort: 3333,
      defaultUserId: "12345",
      magicDateTime: {
        prefix: "{{",
        suffix: "}}",
      },
      developerNotesTagName: "developerNotes",
    },
    dotConfig: {
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
    },
    "validateMethodOverrides": true
  };
  expect(config).toEqual(expectedResult);
});
