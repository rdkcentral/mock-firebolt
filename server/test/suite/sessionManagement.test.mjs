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

// sessionManagement: Tests

"use strict";

import fs from "fs";
import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as sessionManagement from "../../src/sessionManagement.mjs";

test(`sessionManagement.stopRecording works properly in case of throwing error`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => { return error});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(spy).toHaveBeenCalled();
  expect(result).toBe(null);
});

describe(`Session`, () => {
  const session = new sessionManagement.Session();

  test(`should return null`, () => {
    const result = session.exportSession();
    expect(result).toBe(null);
  });
  test(`should return filepath`, () => {
    const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    const result = session.exportSession();
    expect(spy).toHaveBeenCalled();
    expect(result).toMatch(/(sessions)/);
    spy.mockClear();
  });
});

describe(`FireboltCall`, () => {
  const fireboltCall = new sessionManagement.FireboltCall(
    "Test Method",
    "Test Parameters"
  );
  test(`should instantiate`, () => {
    expect(fireboltCall.methodCall).toEqual("Test Method");
  });
});

test(`sessionManagement.startRecording works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  sessionManagement.startRecording();
  expect(spy).toHaveBeenCalled();
});

test(`sessionManagement.stopRecording works properly for file condition`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toMatch(/(sessions)/);
});

test(`sessionManagement.stopRecording works properly for else path`, () => {
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

test(`sessionManagement.isRecording works properly`, () => {
  if (true) {
    sessionManagement.startRecording();
    const result = sessionManagement.isRecording();
    expect(result).toBeTruthy();
    sessionManagement.stopRecording();
  }
  const result = sessionManagement.isRecording();
  expect(result).toBeFalsy();
});

test(`sessionManagement.addCall works properly`, () => {
  sessionManagement.startRecording();
  const result = sessionManagement.addCall("methodName", "Parameters");
  expect(result).toBeUndefined();
});

test(`verify sortJsonByTime method is working`, () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  session.sortJsonByTime({ "sessionStart": 1660644687500, "sessionEnd": 1660644699862, "calls": [ { "methodCall": "moneybadger.logMoneyBadgerLoaded", "params": { "startTime": 1660644697447, "version": "4.10.0-7e1cc95" }, "timestamp": 1660644697456, "sequenceId": 1 }, { "methodCall": "lifecycle.onInactive", "params": { "listen": true }, "timestamp": 1660644697795, "sequenceId": 2, "response": { "result": { "listening": true, "event": "lifecycle.onInactive" }, "timestamp": 1660644697796 } }]});
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});

test('verify updateCallWithResponse is working', () => {
  sessionManagement.addCall("testing", {});
  const result = sessionManagement.updateCallWithResponse("testing", "testing_session", "result")
  expect(result).toBeUndefined();
})

test('verify a session output directory is created when it does not exist', () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(result).toMatch(/(sessions)/);
  spy.mockClear();
  spy2.mockClear();
})

test('verify a session output raw wrties raw output', () => {
  const session = new sessionManagement.Session();
  session.sessionOutput = 'raw';
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(raw)/);
  expect(result).toMatch(/(Succesfully wrote output in raw format to)/);
  spy.mockClear();
})

test('verify a session output mock-overrides calls conversion method', () => {
  const session = new sessionManagement.Session();
  session.sessionOutput = 'mock-overrides';
  const spy = jest.spyOn(session, "convertJsonToYml").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(mocks)/);
  expect(result).toMatch(/(Succesfully wrote output in mock-overrides format to)/);
  spy.mockClear();
})


test('sessionManagement.setOutputDir works properly', () => {
  //const session = new sessionManagement.Session();
  await sessionManagement.startRecording();
  //session.sessionOutputPath = './sessions';
  sessionManagement.setOutputDir('./test');
  expect(JSON.stringify(sessionManagement.sessionRecording)).toBe('./test');
  expect(session.mockOutputPath).toBe('./test');
})

// test('sessionManagement.setOutputFormat works properly', () => {
//   const session = new sessionManagement.Session();
//   session.sessionOutput = 'log';
//   sessionManagement.setOutputDir('test');
//   expect(session.sessionOutputPath).toBe('test');
//   expect(session.mockOutputPath).toBe('test');
// })

// test('sessionManagement.handleSingleExampleMethod TODO', () => {
//   const session = new sessionManagement.Session();
//   const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
//   const emptyInputResult = session.convertJsonToYml();
//   expect(spy).toHaveBeenCalled();
//   expect(emptyInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);

//   const nullInputResult = session.convertJsonToYml();
//   expect(spy).toHaveBeenCalled();
//   expect(nullInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);
  
//   spy.mockClear();
// })

// test('sessionManagement.convertJsonToYml handles empty and null input', () => {
//   const session = new sessionManagement.Session();
//   const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
//   const emptyInputResult = session.convertJsonToYml();
//   expect(spy).toHaveBeenCalled();
//   expect(emptyInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);

//   const nullInputResult = session.convertJsonToYml();
//   expect(spy).toHaveBeenCalled();
//   expect(nullInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);
  
//   spy.mockClear();
// })

// test('sessionManagement.convertJsonToYml works properly with single method calls input', () => {
//   const session = new sessionManagement.Session();
//   const input = {
//     "sessionStart": 1662743850633,
//     "sessionEnd": 1662743893317,
//     "calls": [
//         {
//             "methodCall": "advertising.advertisingId",
//             "params": {},
//             "timestamp": 1662743862314,
//             "sequenceId": 1,
//             "response": {
//                 "result": {
//                     "ifa": "01234567-89AB-CDEF-GH01-23456789ABCD",
//                     "ifa_type": "idfa",
//                     "lmt": "0"
//                 },
//                 "timestamp": 1662743862322
//             }
//         },
//         {
//             "methodCall": "advertising.deviceAttributes",
//             "params": {},
//             "timestamp": 1662743866706,
//             "sequenceId": 2,
//             "response": {
//                 "result": {},
//                 "timestamp": 1662743866716
//             }
//         },
//         {
//             "methodCall": "appcatalog.apps",
//             "params": {
//                 "request": {}
//             },
//             "timestamp": 1662743885216,
//             "sequenceId": 3,
//             "response": {
//                 "error": {
//                     "code": -32601,
//                     "message": "Method not found"
//                 },
//                 "timestamp": 1662743885217
//             }
//         }
//     ]
// };
//   const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
//   const spy2 = jest.spyOn(session, "handleSingleExampleMethod").mockImplementation(() => false);
//   const result = session.convertJsonToYml(JSON.stringify(input));
//   expect(spy).toHaveBeenCalled();
//   //expect(spy2).toHaveBeenCalled();
//   // expect(emptyInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);

//   // const nullInputResult = session.convertJsonToYml();
//   // expect(spy).toHaveBeenCalled();
//   // expect(nullInputResult.stack).toMatch(/(Unexpected token u in JSON at position 0)/);
  
//   spy.mockClear();
// })