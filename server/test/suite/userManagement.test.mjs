/*
 * Copyright 2021 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// userManagement: Tests

"use strict";

import { jest } from "@jest/globals";
import * as userManagement from "../../src/userManagement.mjs";

test(`userManagement.getUser works properly`, () => {
  const expectedResult = ["12345"];
  const result = userManagement.getUsers();
  expect(result).toEqual(expect.arrayContaining(expectedResult));
});

test(`userManagement.isKnownUser works properly`, () => {
  const dummyArray = ["12345", "67895"];
  const expectedResult = [true, false];
  dummyArray.forEach((userId, index) => {
    const result = userManagement.isKnownUser(userId);
    expect(result).toBe(expectedResult[index]);
  });
});

test(`userManagement.getWssForUser works properly`, () => {
  const dummyArray = ["12345", "67895"];
  const expectedResult = [
    '{"_events":{},"_eventsCount":1,"clients":{},"_shouldEmitClose":false,"options":{"maxPayload":104857600,"skipUTF8Validation":false,"perMessageDeflate":false,"handleProtocols":null,"clientTracking":true,"verifyClient":null,"noServer":true,"backlog":null,"server":null,"host":null,"path":null,"port":null},"_state":0}',
    undefined,
  ];
  dummyArray.forEach((userId, index) => {
    const result = JSON.stringify(userManagement.getWssForUser(userId));
    if (userManagement.isKnownUser(userId)) {
      expect(result).toBe(expectedResult[index]);
    } else expect(result).toBeUndefined();
  });
});

test(`userManagement.getWsForUser works properly`, () => {
  const userId = "12345",
    userId1 = "23456";
  userManagement.testExports.user2ws.set("12345", "test");
  const result = userManagement.getWsForUser(userId);
  const result1 = userManagement.getWsForUser(userId1);
  expect(result).toBe("test");
  expect(result1).toBeUndefined();
});

test(`userManagement.addUser works properly`, () => {
  const userId = "12345";
  expect(userManagement.addUser(userId)).toBeUndefined();
});

test(`userManagement.removeUser works properly`, () => {
  const userId = "12345";
  const spy = jest.spyOn(Map.prototype, "delete");
  userManagement.removeUser(userId);
  expect(spy).toHaveBeenCalled();
});
