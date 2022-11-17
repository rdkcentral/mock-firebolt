"use strict";

import { expect, jest, test, afterAll, beforeAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(30040);

const httpPort = 3336;
const socketPort = 9009;

beforeAll(async () => {
  console.log(
    await utilities.mfState(
      true,
      ` -- --manage --discovery --httpPort ${httpPort} --socketPort ${socketPort}`
    )
  );
});

afterAll(async () => {
  //Stop Mock Firebolt
  console.log(await utilities.killPort(socketPort));
});

test(`OPENRPC Response`, async () => {
  const response = await utilities.fireboltCommand(
    JSON.stringify({
      method: "accessibility.closedCaptionsSettings",
      params: {},
      id: 0,
    }),
    socketPort
  );
  expect(response.includes('"enabled":true')).toEqual(true);
});
