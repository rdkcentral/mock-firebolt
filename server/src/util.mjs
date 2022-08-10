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

// Utilities

'use strict';

import * as tmp from 'tmp';

import { config } from './config.mjs';

// Use: await delay(2000);
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Return random in between min and max, inclusive ( [min, max] )
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get userId from NodeJS Express request object
function getUserIdFromReq(req) {
  const userId = req.get('x-mockfirebolt-userid') || config.app.defaultUserId;
  return userId;
}

function createTmpFile(prefix, postfix) {
  const tmpObj = tmp.fileSync({ mode: 0o644, prefix: prefix, postfix: postfix });
  return tmpObj;
}

// --- Exports ---

export {
  delay, randomIntFromInterval,
  getUserIdFromReq, createTmpFile
};
