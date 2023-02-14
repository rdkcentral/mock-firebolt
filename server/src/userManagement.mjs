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
import {state} from './stateManagement.mjs';
import { logger } from './logger.mjs';
import * as util from './util.mjs'

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

function parseUser(userId) {
  if (userId == null || userId == undefined) {
    return userId
  }

  //Some shortcuts for code readability
  let isGroupMember = userId.includes("~")
  let hasAppId = userId.includes("#")
  let output = {}

  //Extract appId if applicable
  if (hasAppId) {
    let index = userId.indexOf("#")
    output.appId = userId.substring(index + 1)
    userId = userId.substring(0, index)
  }

  //Extract group if applicable
  if (isGroupMember) {
    let index = userId.indexOf("~")
    output.group = userId.substring(index + 1)
    userId = userId.substring(0, index)
  }

  //Whatever's left is our userId
  if (userId.length > 0) {
    output.user = userId
  }

  return output;
}

function getWssForUser(userId) {
  if ( user2wss.has(''+userId) ) {
    return user2wss.get(''+userId);
  }
  return undefined;
}

function getWsForUser(userId) {
  let wsArray = [];
  console.log(`Inside get`)
  //console.log(user2ws)
  if ( user2ws.has(''+userId) ) {
    console.log(`User EXIST`)
    wsArray=user2ws.get(''+userId);
    console.log(`the latest connection for ${userId}`)
    console.log(wsArray)
    console.log("slicing Array")
    let lastWsConnection=wsArray[(wsArray.length-1)]
    console.log(lastWsConnection)
    return lastWsConnection;
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

  // creating an object map with ws and userId (of same user group) as key value pair
  const wsUserMap = new Map();
  for (const us of userList){
    wsUserMap.set(getWsForUser(''+us),us);
  }
  //remove undefined keys
  wsUserMap.delete();
  return wsUserMap;
}

function associateUserWithWss(userId, wss) {
  user2wss.set(''+userId, wss);
}

function associateUserWithWs(userId, ws) {
  //let connection1=JSON.stringify(ws)
 // console.log(`User id added for ${userId} and ws ${connection1} `)
  console.log(`User id added for ${userId} and ws ${ws} `)
  
  let wsArray = [];
  if(user2ws.has(''+userId)){
    wsArray = user2ws.get(''+userId)
    wsArray.push(ws);
 //   console.log(`Key exist ${userId}`);
 //   console.log(wsArray)
  } else {
    wsArray.push(ws)
    user2ws.set(''+userId, wsArray);
 //   console.log(`Initialized for first time ${userId}`);
 //   console.log(wsArray)
  }
  
  console.log(`User List ${user2ws}`)
  console.log(user2ws)
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

function heartbeat(ws) {
  ws.isAlive = true;
}

function addUser(userId) {
  userId = "" + userId;
  var users = getUsers();

  let parsedUserId = parseUser(userId);
  let user = parsedUserId.user
  let appId = parsedUserId.appId
  let group = parsedUserId.group

  //getting user, group and appId from userId
  if (userId.includes("~")){
    user = userId.split("~")[0];
    if (userId.includes("#")){
      appId = userId.split("#")[1];
      group = "~"+userId.split("#")[0].split('~')[1];
    }
    else{
      group = "~"+userId.split('~')[1];
    }
  }
  else if (userId.includes("#")){
    user = userId.split("#")[0];
    appId = userId.split("#")[1];
  }
  else{
    user = userId;
  }

//iterating over list of users in state to ensure duplicate user/appId
  for(var key in users){
    if (users[key].includes("~")){
      if (user && users[key].split("~")[0]==user){
          logger.info(`Cannot map user ${userId} to ws as user ${user} already exists`)
          return false
      }
      else if(appId && users[key].includes("#") && users[key].split("#")[1]==appId){
        logger.info(`Cannot map user ${userId} to ws as appId ${appId} already exists`)
        return false
      }
    }
    else if (users[key].includes("#")){
      if (user && users[key].split("#")[0]==user){
        logger.info(`Cannot map user ${userId} to ws as appId ${user} already exists`)
        return false
      }
      else if (appId && users[key].split("#")[1]==appId){
        logger.info(`Cannot map user ${userId} to ws as user ${appId} already exists`)
        return false
      }
    }
    else{
      if (user && users[key] == user){
        logger.info(`Cannot map user ${userId} to ws as user ${user} already exists`)
        return false
      }
    }
  }

  const wss = new WebSocketServer({ noServer: true });
  associateUserWithWss(''+userId, wss);
  wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', async hb => {
      heartbeat(ws)
    });
    associateUserWithWs(''+userId, ws);
    handleGroupMembership(''+userId)
    ws.on('message', async message => {
      messageHandler.handleMessage(message, ''+userId, ws);
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', function close() {
    clearInterval(interval);
  });
  return true;
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
  user2wss, user2ws, group2user, associateUserWithWs, handleGroupMembership, heartbeat
}

export {
  getUsers, isKnownUser, parseUser, getWssForUser, getWsForUser, addUser, removeUser, getWsListForUser, getUserListForUser
};
