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

// Event-related state and utility functions

'use strict';

import * as stateManagement from './stateManagement.mjs';
import * as userManagement from './userManagement.mjs';
import { eventTriggers } from './triggers.mjs';
import { logger } from './logger.mjs';
import * as fireboltOpenRpc from './fireboltOpenRpc.mjs';
import { config } from './config.mjs';
import { updateCallWithResponse } from './sessionManagement.mjs';

function logSuccess(onMethod, result, msg) {
  logger.info(
    `${msg}: Sent event ${onMethod} with result ${JSON.stringify(result)}`
  );
};

function logErr(onMethod) {
  logger.info(
    `Could not send ${onMethod} event because no listener is active`
  );
};

function logFatalErr() {
  logger.info(`Internal error`);
};

// Maps full userIds to maps which map event listner request method
// name (e.g., lifecycle.onInactive) to message id (e.g., 17)
const eventListenerMap = {};

// Associate this message ID with this method so if/when events are sent, we know which message ID to use
function registerEventListener(userId, oMsg) {
  if ( ! eventListenerMap[userId] ) {
    eventListenerMap[userId] = {};
  }
  eventListenerMap[userId][oMsg.method] = oMsg.id;
  logger.debug(`Registered event listener mapping: ${userId}:${oMsg.method}:${oMsg.id}`);
}

// Return true if at least one user in the user’s group is registered for the given method
function isAnyRegisteredInGroup(userId, method) {
  const userList = userManagement.getUserListForUser(userId);
  for (const user of userList){
    if ( isRegisteredEventListener(user, method) ){
      return true;
    }
  }
  return false;
}

function isRegisteredEventListener(userId, method) {
  if ( ! eventListenerMap[userId] ) { return false; }
  return ( method in eventListenerMap[userId] );
}

function getRegisteredEventListener(userId, method) {
  if ( ! eventListenerMap[userId] ) { return undefined; }
  return eventListenerMap[userId][method];
}

// Remove mapping from event listener request method name from our map
// Attempts to send events to this listener going forward will fail
function deregisterEventListener(userId, oMsg) {
  if ( ! eventListenerMap[userId] ) { return; }
  delete eventListenerMap[userId][oMsg.method];
  logger.debug(`Deregistered event listener for method: ${userId}:${oMsg.method}`);
}

// Is the given (incoming) message one that enables or disables an event listener?
// Example: {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true|false},"id":1}
// Key: The 'on' in the unqualified method name, and (2) the params.listen parameter (regardless of true|false)
function isEventListenerMessage(oMsg) {
  const fqMethodName = oMsg.method
  const methodName = fqMethodName.substring(fqMethodName.lastIndexOf('.') + 1);
  return ( methodName.startsWith('on') && 'listen' in oMsg.params );
}

// Is the given (incoming) message one that enables an event listener?
// Example: {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
// Key: The params.listen === true value
function isEventListenerOnMessage(oMsg) {
  if ( ! isEventListenerMessage(oMsg) ) { return false; }
  return ( oMsg.params && oMsg.params.listen );
}

// Is the given (incoming) message one that disables an event listener?
// Example: {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":false},"id":1}
// Key: The params.listen === true value
function isEventListenerOffMessage(oMsg) {
  if ( ! isEventListenerMessage(oMsg) ) { return false; }
  return ( oMsg.params && ! oMsg.params.listen );
}

// Respond to an event listener request with an ack
// Example:
//   For request:
//     {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
//   Send ack response:
//     {"jsonrpc":"2.0","result":{"listening":true, "event":"lifecycle.onInactive"},"id":1}
function sendEventListenerAck(ws, oMsg) {
  const oAckMessage = {
    jsonrpc: '2.0',
    result: {
      listening: true,
      event: oMsg.method
    },
    id: oMsg.id
  };
  // Could do, but why?: const dly = db.getAppropriateDelay(user, method); await util.delay(dly);
  const ackMessage = JSON.stringify(oAckMessage);
  ws.send(ackMessage);
  logger.debug(`Sent event listener ack message: ${ackMessage}`);
  updateCallWithResponse(oMsg.method, oAckMessage.result, "result")
}

function sendEvent(ws, userId, method, result, msg, fSuccess, fErr, fFatalErr){
  coreSendEvent(false, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr);
}

function sendBroadcastEvent(ws, userId, method, result, msg, fSuccess, fErr, fFatalErr){
  coreSendEvent(true, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr);
}

// sending response to web-socket
function emitResponse(ws, finalResult, msg, userId, method){
  let id = getRegisteredEventListener(userId, method);
  const oEventMessage = {
    jsonrpc: '2.0',
    id: id,
    result: finalResult
  };
  const eventMessage = JSON.stringify(oEventMessage);
  // Could do, but why?: const dly = stateManagement.getAppropriateDelay(user, method); await util.delay(dly);
  ws.send(eventMessage);
  logger.info(`${msg}: Sent event message to user ${userId}: ${eventMessage}`);
}

// sendEvent to handle post API event calls, including pre- and post- event trigger processing
function coreSendEvent(isBroadcast, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr) {
  try {
    if (  ! isBroadcast && !isRegisteredEventListener(userId, method) ) {
      logger.info(`${method} event not registered`);
      fErr.call(null, method);

    } else if ( isBroadcast && !isAnyRegisteredInGroup(userId, method) ){
      logger.info(`${method} event not registered`);
      fErr.call(null, method);

    } else {
       // Fire pre trigger if there is one for this method
       if ( method in eventTriggers ) {
        if ( 'pre' in eventTriggers[method] ) {
          try {
            const ctx = {
              logger: logger,
              setTimeout: setTimeout,
              setInterval: setInterval,
              set: function ss(key, val, scope) { return stateManagement.setScratch(userId, key, val, scope) },
              get: function gs(key) { return stateManagement.getScratch(userId, key); },
              delete: function ds(key, scope) { return stateManagement.deleteScratch(userId, key, scope)},
              uuid: function cuuid() {return stateManagement.createUuid()},
              sendEvent: function(method, result, msg) {
                sendEvent( ws, userId, method, result, msg, logSuccess.bind(this, method, result, msg), logErr.bind(this, method), logFatalErr.bind(this) );
              },
              sendBroadcastEvent: function(onMethod, result, msg) {
                sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
              }
            };
            logger.debug(`Calling pre trigger for event ${method}`);
            eventTriggers[method].pre.call(null,ctx);
          } catch ( ex ) {
            logger.error(`ERROR: Exception occurred while executing pre-trigger for ${method}; continuing`);
          }
        }
      }

      const response = {result : result};
      let postResult;
      
      // Fire post trigger if there is one for this method
      if ( method in eventTriggers ) {
        if ( 'post' in eventTriggers[method] ) {
          try {
            const ctx = {
              logger: logger,
              setTimeout: setTimeout,
              setInterval: setInterval,
              set: function ss(key, val, scope) { return stateManagement.setScratch(userId, key, val, scope) },
              get: function gs(key) { return stateManagement.getScratch(userId, key); },
              delete: function ds(key, scope) { return stateManagement.deleteScratch(userId, key, scope)},
              uuid: function cuuid() {return stateManagement.createUuid()},
              sendEvent: function(method, result, msg) {
                sendEvent( ws, userId, method, result, msg, logSuccess.bind(this, method, result, msg), logErr.bind(this, method), logFatalErr.bind(this) );
              },
              sendBroadcastEvent: function(onMethod, result, msg) {
                sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
              },
              ...response
            };
            logger.debug(`Calling post trigger for event ${method}`);
            // post trigger can return undefined to leave as-is or can return a new result object
            postResult = eventTriggers[method].post.call(null, ctx);
          } catch ( ex ) {
            {
              logger.error(`ERROR: Exception occurred while executing post-trigger for ${method}`);
              logger.error(ex);
            }
          }
        }
      }

      const finalResult = ( postResult ? postResult : result );
      // Error to be logged in "novalidate mode" if result validation failed
      if( config.validate.includes("events") ) {
        const resultErrors = fireboltOpenRpc.validateMethodResult(finalResult, method);
        if ( resultErrors && resultErrors.length > 0 ) {
          fErr.call(null, method);
          return
        }
      }
      // There may be more than one app using different base userId values
      // but the same group name. We need to send the event to all
      // clients/apps within the group (whether just this one or more than one).
      if( isBroadcast ){
        // object map with ws and userid as key value pair
        const wsUserMap = userManagement.getWsListForUser(userId);
        // looping over each web-sockets of same group
        if ( wsUserMap && wsUserMap.size >=1 ) {
          wsUserMap.forEach ((userWithSameGroup, ww) => {
            emitResponse(ww, finalResult, msg, userWithSameGroup, method);
          });
          fSuccess.call(null);
        } else {
          // Internal error
          const msg = 'sendEvent: ERROR: Internal Error: No sockets in list';
          throw new Error(msg);
        }
      } else {
        emitResponse(ws, finalResult, msg, userId, method);
        fSuccess.call(null);
      }
    }
  } catch ( ex ) {
    logger.error('sendEvent: ERROR:');
    logger.error(ex);
    fFatalErr.call(null, ex);
  }
}

// --- Exports ---

export const testExports = {
  eventListenerMap,
  isRegisteredEventListener,
  getRegisteredEventListener,
  isAnyRegisteredInGroup,
  sendBroadcastEvent,
  emitResponse
}

export {
  registerEventListener, deregisterEventListener,
  isEventListenerOnMessage, isEventListenerOffMessage,
  sendEventListenerAck,
  sendEvent, sendBroadcastEvent, logSuccess, logErr,
  logFatalErr
};
