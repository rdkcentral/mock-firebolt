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

// stateManagement: Tests

"use strict";

import {
  jest
} from "@jest/globals";
import {
  logger
} from "../../src/logger.mjs";
import * as stateManagement from "../../src/stateManagement.mjs";

//jest.mock('stateManagement');

test(`stateManagement.addUser works properly`, () => {
  const userId = 123;
  const result = stateManagement.addUser(userId);
  expect(result.isSuccess).toEqual(true);
});

test(`stateManagement.addUser works properly for same user`, () => {
  const userId = "456~A#netflix";
  expect( stateManagement.addUser(userId).isSuccess ).toEqual(true);
  stateManagement.addUser(userId);
  const userId1 = "456~A#amazon";
  expect(stateManagement.addUser(userId1).isSuccess).toEqual(false);
});

test(`stateManagement.addUser works properly for same appId`, () => {
  const userId2 = "789~A#netflix";
  expect(stateManagement.addUser(userId2).isSuccess).toEqual(false);
});

test(`stateManagement.addUser works properly for same user without group`, () => {
  stateManagement.addUser("111#youtube");
  const userId3 = "111#amazon";
  const result3 = stateManagement.addUser(userId3);
  expect(result3.isSuccess).toEqual(false);

  const userId4 = "222#youtube";
  const result4 = stateManagement.addUser(userId4);
  expect(result4.isSuccess).toEqual(false);
});


test(`stateManagement.getUserId works properly`, () => {
  const userId = "456";
  expect(stateManagement.getUserId(userId)).toEqual("456~A#netflix");

  const userId2 = "youtube"
  expect(stateManagement.getUserId(userId2)).toEqual("111#youtube");

  const userId3 = "~A"
  expect(stateManagement.getUserId(userId3)).toEqual("~A");
});

test(`stateManagement.getState works properly`, () => {
  const result1 = stateManagement.getState(12345);
  const expectedResult = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    scratch: {},
    methods: {},
    sequenceState: {},
    isDefaultUserState: true
  }
  expect(result1).toEqual(expectedResult);

});

test(`stateManagement.getState for invalid user works properly`, () => {
  const spy1 = jest.spyOn(logger, "info");
  stateManagement.getState("101");
  expect(spy1).toHaveBeenCalled();

});

test(`stateManagement.getState works properly for global and group when there is no group level override`, () => {
  stateManagement.testExports.state["global"] = {
    methods: { 'account.id': { result: 'A111', scope: 'global' } }
  }
  stateManagement.addUser("~B")
  const expectedResult2 =
  {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: { 'account.id': { result: 'A111', scope: 'global' } },
    scratch: {},
    sequenceState: {}
  }
  const result2 = stateManagement.getState("~B");
  expect(result2).toEqual(expectedResult2);
});

test(`stateManagement.getState works properly for group and user when there is no user level override`, () => {
  stateManagement.testExports.state["~A"] = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {
      "account.id": {
        "result": "A222",
        "scope": "group"
      },
      "account.uid": {
        "result": "A111-222",
        "scope":"group"
      },
    }
  };

  stateManagement.addUser("756~A")
  const result2 = stateManagement.getState("756~A");
  const expectedResult2 = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {
      "account.id": {
        "result": "A222",
        "scope": "group"
      },
      "account.uid": {
        "result": "A111-222",
        "scope": "group"
      },
    },
    scratch: {},
    sequenceState: {},
  };
  expect(result2).toEqual(expectedResult2);
});

test(`stateManagement.getAppropriateDelay works properly`, async () => {
  stateManagement.testExports.state[4567] = {
    global: {
      mode: "Default",
    },
  };
  const resultOne = await stateManagement.getAppropriateDelay(
    4567,
    "accessibility.closedCaptions"
  );
  expect(resultOne).toBeUndefined();

  stateManagement.testExports.state[6789] = {};
  const resultTwo = await stateManagement.getAppropriateDelay(
    6789,
    "accessibility.closedCaptions"
  );
  expect(resultTwo).toBeUndefined();

  stateManagement.testExports.state[9012] = {
    global: {
      mode: "Default",
      latency: {
        "accessibility.closedCaptions": {
          min: 3,
          max: 3,
        },
      },
    },
  };
  const output = await stateManagement.getAppropriateDelay(
    9012,
    "accessibility.closedCaptions"
  );
  expect(output).toBe(3);

  const result = await stateManagement.getAppropriateDelay(
    12345,
    "accessibility.closedCaptions"
  );
  expect(result).toBe(0);
});

test(`getMethodResponse works properly`, () => {
  const dummyParams = [];
  const expectedResult = {};
  const result = stateManagement.getMethodResponse(
    "12345",
    "accessibility.closedCaptions",
    dummyParams
  );
  expect(result).toEqual(expectedResult);
});

test(`stateManagement.updateState works properly`, () => {
  stateManagement.testExports.state["12345"] = {
    isDefaultUserState: true
  };
  const userId1 = "12345",
    userId2 = "56789";
  const newState = {
    global: {
      latency: {
        min: 3000,
        max: 3000,
      },
    },
  };
  const spy1 = jest.spyOn(logger, "info");
  stateManagement.updateState(userId1, newState);
  expect(spy1).toHaveBeenCalled();

  const spy2 = jest.spyOn(logger, "info");
  stateManagement.updateState(userId2, newState);
  expect(spy2).toHaveBeenCalled();
});

test(`stateManagement.updateState with scope works properly`, () => {
  stateManagement.testExports.state["123~A"] = {
    isDefaultUserState: true
  };
  const userId1 = "12345",
    scope = "123~A";
  const newState = {
    global: {
      latency: {
        min: 3000,
        max: 3000,
      },
    },
  };
  const spy1 = jest.spyOn(logger, "info");
  stateManagement.updateState(userId1, newState, scope);
  expect(spy1).toHaveBeenCalled();
});

test(`stateManagement.updateState and stateManagement.getState works properly for global and group when there is a group level override`, () => {
  stateManagement.testExports.state["global"] = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {},
    scope: "global"
  }
  stateManagement.addUser("~B")
  const userId1 = "~B"
  const newState = {
    scope: "group"
  }
  stateManagement.updateState(userId1, newState);
  const result2 = stateManagement.getState("~B");
  const expectedResult2 = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {},
    scope: "group",
    scratch: {},
    sequenceState: {}
  }

  expect(result2).toEqual(expectedResult2);
});

test(`stateManagement.updateState and stateManagement.getState works properly for group and user when there is a user level override`, () => {
  stateManagement.testExports.state["~B"] = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {},
    scope: "group",
    scratch: {},
    sequenceState: {}
  }
  stateManagement.addUser("123~B")
  const userId1 = "123~B"
  const newState = {
    scope: "user"
  };
  stateManagement.updateState(userId1, newState);
  const result2 = stateManagement.getState("123~B");
  const expectedResult2 = {
    global: { mode: 'DEFAULT', latency: { min: 0, max: 0 } },
    methods: {},
    scope: "user",
    scratch: {},
    sequenceState: {}
  }

  expect(result2).toEqual(expectedResult2);
});

test(`stateManagement.revertState works properly`, () => {
  const userId = 12345;
  const spy = jest.spyOn(JSON, "stringify");
  stateManagement.revertState(userId);
  expect(spy).toHaveBeenCalled();

  const spy1 = jest.spyOn(logger, "info");
  const result2 = stateManagement.revertState(34567);
  expect(spy1).toHaveBeenCalled();
});

test(`stateManagement.setLatency works properly`, () => {
  const userId = 12345,
    min = 3000,
    max = 3000;
  expect(stateManagement.setLatency(userId, min, max)).toBeUndefined();
});

test(`stateManagement.setLatencies works properly`, () => {
  const dummyoLatency = {
    min: 0,
    max: 0,
    device: {
      type: {
        min: 3000,
        max: 3000
      }
    },
  };
  const userId = 12345;
  expect(stateManagement.setLatencies(userId, dummyoLatency)).toBeUndefined();
});

test(`stateManagement.isLegalMode works properly`, () => {
  const dummyMode = ["default", "box", "xyz"];
  dummyMode.forEach((modes) => {
    const result = stateManagement.isLegalMode(modes);
    if (modes === "xyz") expect(result).toBeFalsy();
    else expect(result).toBeTruthy();
  });
});

test(`stateManagement.setMode works properly`, () => {
  const userId = 12345,
    mode = "box";
  expect(stateManagement.setMode(userId, mode)).toBeUndefined();
});

test(`stateManagement.setMethodError is woring properly`, () => {
  const userId = 12345,
    methodName = "accessibility.closedCaptionsSettings";
  const error = {
    code: -32601,
    message: "Not supported",
  };
  expect(
    stateManagement.setMethodError(
      userId,
      methodName,
      error.code,
      error.message
    )
  ).toBeUndefined();
});

test(`stateManagement.setScratch works properly`, () => {
  const key = "closedCaptionsSettings",
    userId = 12345;
  const value = {
    enabled: true,
    styles: {
      fontFamily: "Monospace sans-serif",
      fontSize: 1,
      fontColor: "#ffffff",
      fontEdge: "none",
      fontEdgeColor: "#7F7F7F",
      fontOpacity: 100,
      backgroundColor: "#000000",
      backgroundOpacity: 100,
      textAlign: "center",
      textAlignVertical: "middle",
    },
  };
  expect(stateManagement.setScratch(userId, key, value)).toBeUndefined();
});

test(`stateManagement.getScratch works properly`, () => {
  const userId = 12345;
  const keysArray = ["closedCaptionsSettings", "abc"];
  keysArray.forEach((key) => {
    const result = stateManagement.getScratch(userId, key);
    if (result && result.enabled) {
      expect(result.enabled).toBe(true);
    }
  });
});

test(`stateManagement.deleteScratch works properly`, () => {
  const userId = 12345;
  const key = "closedCaptionsSettings";
  expect(stateManagement.deleteScratch(userId, key,)).toBeUndefined();
});

test(`stateManagement.deleteScratch with scope works properly`, () => {
  stateManagement.testExports.state["123~A"] = {
    global: {
      latency: {
        max: 0,
        min: 0
      },
      mode: "DEFAULT"
    },
    methods: {},
    scratch: {
      "account.id": {
        result: "A222"
      },
    },
    sequenceState: {},
  };

  const userId = 12345,
      scope = "123~A"
  const key = "account.id";
  expect(stateManagement.deleteScratch(userId, key, scope)).toBeUndefined();
});


test(`stateManagement.handleStaticAndDynamicError works properly`, () => {
  const userId = "12345",
    methodName = "rpc.discover",
    params = [],
    resp1 = {
      error: "function()12345"
    },
    resp2 = "test-elsePath";
  const expectedResult1 = {
    result: "NOT-IMPLEMENTED-YET",
  };
  const result1 = stateManagement.testExports.handleStaticAndDynamicError(
    userId,
    methodName,
    params,
    resp1
  );
  const result2 = stateManagement.testExports.handleStaticAndDynamicError(
    userId,
    methodName,
    params,
    resp2
  );
  expect(result1).toEqual(expectedResult1);
  expect(result2).toBe(resp2);
});

test(`stateManagement.validateMethodOverride works properly`, () => {
  const dummyMethodName = "rpc.discover",
    dummyMethodOverrideObject = [{
        result: "result",
      },
      {
        error: "error",
      },
      {
        reponse: "response",
      },
      {
        responses: [{
          result: "result",
        }, ],
      },
      {
        responses: [{
          error: "error",
        }, ],
      },
      {
        responses: [{
          reponse: "response",
        }, ],
      },
    ];
  const expectedResult = [
    "ERROR: Could not validate value result for method rpc.discover",
    "ERROR: error is not a valid error value: Object expected",
    "ERROR: New state data for rpc.discover does not contain 'result' or 'error'; One is required",
    "ERROR: Could not validate value result for method rpc.discover",
    "ERROR: error is not a valid error value: Object expected",
    "ERROR: New state data for rpc.discover has at least one response item that does not contain 'result' or 'error'; One is required",
  ];
  dummyMethodOverrideObject.forEach((obj, index) => {
    const result = stateManagement.testExports.validateMethodOverride(
      dummyMethodName,
      obj
    );
    expect(result[0]).toEqual(expectedResult[index]);
  });
});

test(`stateManagement.getMethodResponse works properly`, () => {
  //testing for resp=handleSequenceOfResponseValues(userId, methodName, params, resp,userState);
  const userIdArray = ["12345", "23456", "34567"],
    methodName = "rpc.discover",
    params = [];
  const obj = {
    12345: {
      global: {
        mode: "DEFAULT",
        latency: {
          min: 0,
          max: 0,
        },
      },
      scratch: {},
      methods: {
        "rpc.discover": {
          responses: [{
            name: "test"
          }],
          policy: "REPEAT-LAST-RESPONSE",
        },
      },
      sequenceState: {},
    },
    23456: {
      global: {
        mode: "DEFAULT",
        latency: {
          min: 0,
          max: 0,
        },
      },
      scratch: {},
      methods: {
        "rpc.discover": {
          responses: [{
            name: "test"
          }],
          policy: "REPEAT-LAST-RESPONSE",
        },
      },
      sequenceState: {
        "rpc.discover": 5,
      },
    },
    34567: {
      global: {
        mode: "DEFAULT",
        latency: {
          min: 0,
          max: 0,
        },
      },
      scratch: {},
      methods: {
        "rpc.discover": {
          responses: [{
            name: "test"
          }],
          policy: "REPEAT-LAST",
        },
      },
      sequenceState: {
        "rpc.discover": 5,
      },
    },
  };
  const expectedResult = [{
    name: "test"
  }, {
    name: "test"
  }, {}];
  userIdArray.forEach((userId, index) => {
    stateManagement.testExports.state[userId] = obj[userId];
    const result = stateManagement.getMethodResponse(
      userId,
      methodName,
      params
    );
    expect(result).toEqual(expectedResult[index]);
  });

  //testing for  resp = handleDynamicResponseValues(userId, methodName, params, resp);
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        response: "function()test",
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.getMethodResponse("12345", methodName, params);
  expect(result).toEqual({});

  //testing for  resp = handleStaticAndDynamicResult(userId, methodName, params, resp);
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        result: "function()test",
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result1 = stateManagement.getMethodResponse(
    "12345",
    methodName,
    params
  );
  expect(result1).toEqual({});

  //testing for  resp = handleStaticAndDynamicResult(userId, methodName, params, resp);
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        result: [{
          name: "test"
        }],
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result2 = stateManagement.getMethodResponse(
    "12345",
    methodName,
    params
  );
  expect(result2).toEqual({
    result: [{
      name: "test"
    }],
    policy: "REPEAT-LAST-RESPONSE",
  });

  //testing for  resp = handleStaticAndDynamicError(userId, methodName, params, resp);
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        error: "test-error",
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result3 = stateManagement.getMethodResponse(
    "12345",
    methodName,
    params
  );
  expect(result3).toEqual({
    error: "test-error",
    policy: "REPEAT-LAST-RESPONSE",
  });

  //testing for  resp = handleDynamicResponseValues(userId, methodName, params, resp);
  const spy = jest.spyOn(logger, "error");
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        response: {
          name: "test"
        },
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result4 = stateManagement.getMethodResponse(
    "12345",
    methodName,
    params
  );
  expect(spy).toHaveBeenCalled();
});

test(`stateManagement.hasOverride works properly with methods.response`, () => {
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        response: {
          name: "test"
        },
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.hasOverride("12345", "rpc.discover");
  expect(result).toBe(true);
});

test(`stateManagement.hasOverride works properly with methods.result `, () => {
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        result: {
          name: "test"
        },
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.hasOverride("12345", "rpc.discover");
  expect(result).toBe(true);
});

test(`stateManagement.hasOverride works properly with methods.error`, () => {
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        error: {
          name: "test_error"
        },
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.hasOverride("12345", "rpc.discover");
  expect(result).toBe(true);
});

test(`stateManagement.hasOverride works properly with methods.responses`, () => {
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        responses: {
          name: "test_error"
        },
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.hasOverride("12345", "rpc.discover");
  expect(result).toBe(true);
});

test(`stateManagement.hasOverride works properly and return false`, () => {
  stateManagement.testExports.state["12345"] = {
    global: {
      mode: "DEFAULT",
      latency: {
        min: 0,
        max: 0,
      },
    },
    scratch: {},
    methods: {
      "rpc.discover": {
        policy: "REPEAT-LAST-RESPONSE",
      },
    },
    sequenceState: {},
  };
  const result = stateManagement.hasOverride("12345", "rpc.discover");
  expect(result).toBe(false);
});

test(`stateManagement.hasOverride works properly and return false for not a valid userID`, () => {
  stateManagement.testExports.state["7574"] = undefined;
  const result = stateManagement.hasOverride("7574", "rpc.discover");
  expect(result).toBe(false);
});

test(`stateManagement.logInvalidMethodError works properly`, () => {
  const spy = jest.spyOn(logger, "error");
  stateManagement.testExports.logInvalidMethodError(
    "DummyCore",
    "Test_Result_Error", {}
  );
  expect(spy).toHaveBeenCalled();
});

test(`stateManagement.mergeCustomizer works properly`, () => {
  const result = stateManagement.testExports.mergeCustomizer([], "dummy_value");
  expect(result).toBe("dummy_value");
});