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

// HTTP-based UI routes: User-Related

'use strict';

import { v4 as uuidv4 } from 'uuid';

import { config } from '../../config.mjs';
import * as userManagement from '../../userManagement.mjs';
import * as stateManagement from '../../stateManagement.mjs';

// --- Route Handlers ---

// GET /users
function listUsers(req, res) {
  const users = userManagement.getUsers();
  res.render('users-list', {
    users: users
  });
}

// GET /users/add
function addUser(req, res) {
  // Generate a unique userId for this user (no vanity userIds, at least for now)
  const userId = uuidv4();

  // Make sure we have a web socket server for this user
  userManagement.addUser(userId);
  // Make sure we have starter (empty) state for this user
  stateManagement.addUser(userId);

  //@TODO(MAYBE): Set cookie and redirect to / (/ plain should show failure message in prod mode)
  //@TODO(MAYBE): Set cookie here and then add a link to the views/users-add.handlebars file?

  res.render('users-add', {
    userId: ''+userId
  });
}

// GET /users/remove
function removeUser(req, res) {
  const userId = req.query.userId;
  let isKnownUser = false;
  if ( userId ) {
    isKnownUser = userManagement.isKnownUser(''+userId);
    if ( isKnownUser ) {
      userManagement.removeUser(''+userId);
    }
  }
  res.render('users-remove', {
    userId: ''+userId,
    isKnownUser: ( isKnownUser ? true : false ),
    isUnknownUser: ( isKnownUser ? false : true )
  });
}

// --- Exports ---

export {
  listUsers, addUser, removeUser
};
