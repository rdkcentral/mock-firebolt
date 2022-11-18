"use strict";

import { expect, jest, test, afterAll, beforeAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20020);

const httpPort = 3001;
const socketPort = 9001;

beforeAll(async () => {
  console.log(
    await utilities.mfState(
      true,
      ` -- --manage --httpPort ${httpPort} --socketPort ${socketPort}`
    )
  );
});

afterAll(async () => {
  //Stop Mock Firebolt
  console.log(await utilities.killPort(socketPort));
});

test(`Validate OPENRPC Response for manage SDK`, async () => {
  const response = await utilities.fireboltCommand(
    JSON.stringify({
      method: "accessory.list",
      params: {},
      id: 0,
    }),
    socketPort
  );
  expect(response.includes(`"protocol":"BluetoothLE"`)).toEqual(true);
});
