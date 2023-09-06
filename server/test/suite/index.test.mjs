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

// index: Tests

'use strict';

import { jest } from "@jest/globals";
import * as index from "../../src/index.mjs";

test(`index works properly`, () => {
  // importing the index.mjs will cover this file
  // As here we don't have any exported functions or variables. 
  // creating dummy test to execute the module.

  expect(1).toBe(1);
});

describe('Session WSS', () => {
  let mockWs;
  let mockReq;

  beforeEach(() => {
    // Mocking WebSocket object
    mockWs = {
      send: jest.fn(),
      on: jest.fn(),
    };
    // Mocking Request object
    mockReq = {
      url: '/12345',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should send welcome message on connection', () => {
    index.wss.emit('connection', mockWs, mockReq);
    expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('You have successfully connected to the MF Session Websocket Server.'));
  });
});
