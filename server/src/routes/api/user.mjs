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

// HTTP-based API routes: User-Related

'use strict';

import { v4 as uuidv4 } from 'uuid';
import * as userManagement from '../../userManagement.mjs';
import * as stateManagement from '../../stateManagement.mjs';


// --- Route Handlers ---

// POST /api/v1/user
// Expected body: N/A
function addUser(req, res) {
  // Generate a unique userId for this user (no vanity userIds, at least for now)
  const userId = uuidv4();

  // Make sure we have a web socket server for this user
  userManagement.addUser(userId);
  // Make sure we have starter (empty) state for this user
  stateManagement.addUser(userId);

  res.status(200).send({
    status: 'SUCCESS',
    userId: userId
  });
}

//GET /api/v1/user
function getUsers(req, res) {
  const users = userManagement.getUsers();
  res.status(200).send({
    status: 'SUCCESS',
    users: users
  });
}


// --- Exports ---

export {
  addUser,getUsers
};
