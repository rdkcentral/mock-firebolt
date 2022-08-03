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

// User management

'use strict';

import WebSocket, { WebSocketServer } from 'ws';
import { config } from './config.mjs';
import * as messageHandler from './messageHandler.mjs';

const user2wss = new Map();
const user2ws  = new Map();
const group2user = new Map(); // "<groupName>" -> [ "<userId1>-<groupName>", ... ]

// Add default user, which will be used anytime a userId is not specified
// in REST calls (calls without an x-mockfirebolt-userid header), regardless of
// whether these are calls to the API via cURL or Postman, or whether these are
// coming from the CLI, the web admin UI, or a browser extension.
addDefaultUser(config.app.defaultUserId);

function getUsers() {
  return Array.from(user2wss.keys());
}

function isKnownUser(userId) {
  return user2wss.has(''+userId);
}

function getWssForUser(userId) {
  if ( user2wss.has(''+userId) ) {
    return user2wss.get(''+userId);
  }
  return undefined;
}

function getWsForUser(userId) {
  if ( user2ws.has(''+userId) ) {
    return user2ws.get(''+userId);
  }
  return undefined;
}

// Given a userId like "123~A", return all userIds like "<xxx>~A" (including the one passed in)
function getUserListForUser(userId) {
  const parts = (''+userId).split('~');
  if ( parts.length === 1 ) {
    // UserId does not have an embedded group name
    return [ ''+userId ];
  }

  const groupName = parts[1];
  if ( group2user.has(groupName) ) {
    return group2user.get(groupName);
  }
  return undefined;
}

function getWsListForUser(userId) {
  const userList = getUserListForUser(userId);
  if ( ! userList ) { return undefined }

  // Covert an array of "<userId>-<groupName" values to an array of ws's
  const wsList = userList.map((userId) => {
    return getWsForUser(''+userId);
  });

  // Filter out any undefined values
  wsList.filter(ws => ws);

  return wsList;
}

function associateUserWithWss(userId, wss) {
  user2wss.set(''+userId, wss);
}

function associateUserWithWs(userId, ws) {
  user2ws.set(''+userId, ws);
}

function handleGroupMembership(userId) {
  const parts = (''+userId).split('~');
  if ( parts.length === 1 ) {
    // UserId does not have an embedded group name
    return;
  }

  const coreUserId = parts[0];
  const groupName = parts[1];
  if ( ! group2user.has(groupName) ) {
    group2user.set(groupName, []);
  }
  const userList = group2user.get(groupName);
  if ( ! userList.includes(''+userId) ) {
    userList.push(''+userId);
  }
  group2user.set(groupName, userList)
}

function addUser(userId) {
  const wss = new WebSocketServer({ noServer: true });
  associateUserWithWss(''+userId, wss);
  wss.on('connection', function connection(ws) {
    associateUserWithWs(''+userId, ws);
    handleGroupMembership(''+userId)
    ws.on('message', async message => {
      messageHandler.handleMessage(message, ''+userId, ws);
    });
  });
}

function addDefaultUser(userId) {
  addUser(''+userId);
  // Could do other things here
}

function removeUser(userId) {
  user2wss.delete(''+userId);
  user2ws.delete(''+userId);
}

// --- Exports ---
export const testExports={
  user2wss, user2ws, group2user, associateUserWithWs, handleGroupMembership
}

export {
  getUsers, isKnownUser, getWssForUser, getWsForUser, addUser, removeUser, getWsListForUser, getUserListForUser
};
