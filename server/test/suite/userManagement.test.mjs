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

jest.useFakeTimers();

test(`userManagement.getUser works properly`, () => {
  const expectedResult = ["12345"];
  const result = userManagement.getUsers();
  expect(result).toEqual(expect.arrayContaining(expectedResult));
});

test(`userManagement.parseUser works properly (User + Group + AppId)`, () => {
  const userId = "123~A#sampleApp"
  const expected = {
    user: "123",
    group: "A",
    appId: "sampleApp"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

test(`userManagement.parseUser works properly (User + Group)`, () => {
  const userId = "123~A"
  const expected = {
    user: "123",
    group: "A"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

test(`userManagement.parseUser works properly (User + AppId)`, () => {
  const userId = "123#sampleApp"
  const expected = {
    user: "123",
    appId: "sampleApp"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

//Not a valid user but should still work
test(`userManagement.parseUser works properly (Group + AppId)`, () => {
  const userId = "~A#sampleApp"
  const expected = {
    group: "A",
    appId: "sampleApp"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

test(`userManagement.parseUser works properly (User)`, () => {
  const userId = "123"
  const expected = {
    user: "123"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

test(`userManagement.parseUser works properly (Group)`, () => {
  const userId = "~A"
  const expected = {
    group: "A"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

//Not a valid user but should still work
test(`userManagement.parseUser works properly (AppId)`, () => {
  const userId = "#sampleApp"
  const expected = {
    appId: "sampleApp"
  }

  expect(userManagement.parseUser(userId)).toEqual(expected)
})

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
    '{"_events":{},"_eventsCount":2,"clients":{},"_shouldEmitClose":false,"options":{"maxPayload":104857600,"skipUTF8Validation":false,"perMessageDeflate":false,"handleProtocols":null,"clientTracking":true,"verifyClient":null,"noServer":true,"backlog":null,"server":null,"host":null,"path":null,"port":null},"_state":0}',
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
  userManagement.testExports.user2ws.set("12345", ["test"]);
  const result = userManagement.getWsForUser(userId);
  const result1 = userManagement.getWsForUser(userId1);
  expect(result).toBe("test");
  expect(result1).toBeUndefined();
  userManagement.testExports.user2ws.delete("12345");
});

test(`userManagement.addUser works properly`, () => {
  const userId = "12345";
  expect(userManagement.addUser(userId)).toEqual(false);
});

test(`userManagement.addUser works properly for same user`, () => {
  const userId = "456~A#sampleApp";
  expect( userManagement.addUser(userId)).toEqual(true);
  userManagement.addUser(userId);
  const userId1 = "456~A#appId3";
  const expectedResult = false;
  const result1 = userManagement.addUser(userId1);
  expect(result1).toEqual(expectedResult);
});

test(`userManagement.addUser works properly for same appId`, () => {
  const userId2 = "789~A#sampleApp";
  const expectedResult2 = false
  const result2 = userManagement.addUser(userId2);
  expect(result2).toEqual(expectedResult2);
});

test(`userManagement.addUser works properly for same user same appId`, () => {
  const userId = "456#sampleApp";
  const expectedResult =false
  const result = userManagement.addUser(userId)
  expect(result).toEqual(expectedResult);
});

test(`userManagement.addUser works properly for same user without group`, () => {
  userManagement.addUser("111#appId2");
  const userId3 = "111#appId3";
  const expectedResult3 = false
  const result3 = userManagement.addUser(userId3);
  expect(result3).toEqual(expectedResult3);

  const userId4 = "222#appId2";
  const expectedResult4 = false
  const result4 = userManagement.addUser(userId4);
  expect(result4).toEqual(expectedResult4);
});

test(`userManagement.addUser works properly for same user same appId same group`, () => {
  const userId = "456~A#sampleApp";
  const expectedResult =false
  const result = userManagement.addUser(userId)
  expect(result).toEqual(expectedResult);
});

test(`userManagement.addUser works properly for same user same appId but different group`, () => {
  const userId = "456~B#sampleApp";
  const expectedResult =false
  const result = userManagement.addUser(userId)
  expect(result).toEqual(expectedResult);
});

test(`userManagement.addUser works properly for different user different appId but same group`, () => {
  const userId = "999~A#appId4";
  const expectedResult =true
  const result = userManagement.addUser(userId)
  expect(result).toEqual(expectedResult);
});

test(`userManagement.removeUser works properly`, () => {
  const userId = "12345";
  const spy = jest.spyOn(Map.prototype, "delete");
  userManagement.removeUser(userId);
  expect(spy).toHaveBeenCalled();
});

test(`userManagement.getWsListForUser works properly`, () => {
  const inputArray = ["123~A", "123", "12345~B"];
  const outputArray = [undefined, "123", undefined];
  userManagement.testExports.group2user.set("A", ["123"]);
  userManagement.testExports.user2ws.set("123", ["123"]);
  inputArray.forEach((input, index) => {
    const result = userManagement.getWsListForUser(input);
    if (typeof result === "object") {
      expect(result.get(input)).toEqual(outputArray[index]);
    } else {
      expect(result).toBeUndefined();
    }
  });
  userManagement.testExports.group2user.delete("A");
  userManagement.testExports.user2ws.delete("123");
});

test(`userManagement.associateUserWithWs works properly`, () => {
  userManagement.testExports.associateUserWithWs("123", "Test");
  const result = userManagement.getWsForUser("123");
  expect(result).toBe("Test");
  userManagement.testExports.user2ws.delete("123");
});

test(`userManagement.handleGroupMembership works properly`, () => {
  userManagement.testExports.handleGroupMembership("123~A");
  const result = userManagement.testExports.group2user.get("A");
  expect(result[0]).toBe("123~A");
  userManagement.testExports.group2user.delete("A");
  userManagement.testExports.user2ws.delete("123");
});

test(`userManagement.handleGroupMembership returns with userId 12345`, () => {
  const result = userManagement.testExports.handleGroupMembership("12345");
  expect(result).toBeUndefined();
});

test(`userManagement.heartbeat returns with websocket isalive true`, () => {
  let ws = {};
  ws.isAlive = false;
  const result = userManagement.testExports.heartbeat(ws);
  expect(ws.isAlive).toBe(true);
});
