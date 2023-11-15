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

import JSONPath from 'jsonpath';
import hbs from 'handlebars';
import * as stateManagement from './stateManagement.mjs';
import * as userManagement from './userManagement.mjs';
import { eventTriggers } from './triggers.mjs';
import { logger } from './logger.mjs';
import * as fireboltOpenRpc from './fireboltOpenRpc.mjs';
import { config } from './config.mjs';
import { updateCallWithResponse } from './sessionManagement.mjs';

const { dotConfig: { eventConfig } } = config;

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

/**
 * Associate this message ID with this method so if/when events are sent, we know which message ID to use
 * @param {string} userId - The user ID associated with the event listener
 * @param {Object} metadata - The metadata object containing information about the event listener registration
 * @param {WebSocket} ws - The WebSocket object associated with the event listener
 * @returns {void}
*/
function registerEventListener(userId, metadata, ws) {
  const { method } = metadata;

  if (!eventListenerMap[userId]) {
    eventListenerMap[userId] = {};
  }

  if (!eventListenerMap[userId][method]) {
    eventListenerMap[userId][method] = { wsArr: [], metadata };
  }

  // Check if ws is already in the wsArr before pushing
  if (!eventListenerMap[userId][method].wsArr.includes(ws)) {
    eventListenerMap[userId][method].wsArr.push(ws);
  }

  logger.debug(`Registered event listener mapping: ${userId}:${method}`);
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

/**
 * Removes the mapping from the event listener request method name from eventListenerMap. 
 * Attempts to send events to this listener going forward will fail.
 * @param {string} userId - The ID of the user.
 * @param {Object} metadata - An object containing metadata for the event.
 * @param {WebSocket} ws - The WebSocket object.
 * @returns {void}
*/
function deregisterEventListener(userId, metadata, ws) {
  const { method } = metadata;
  if (!eventListenerMap[userId] || !eventListenerMap[userId][method]) {
    return;
  }

  const wsArr = eventListenerMap[userId][method].wsArr;
  const wsIndex = wsArr.findIndex((item) => item === ws);

  if (wsIndex !== -1) {
    wsArr.splice(wsIndex, 1);
    logger.debug(`Deregistered event listener mapping: ${userId}:${method}`);
  }

  if (wsArr.length === 0) {
    delete eventListenerMap[userId][method];
  }
}

/**
 * Extracts event data from a given message object based on provided configuration.
 * @param {object} oMsg - The message object to extract event data from.
 * @param {object} config - The configuration object for the event data extraction.
 * @param {boolean} isEnabled - Whether eventListener enable or disable request
 * @returns {object | false} - An object containing the extracted event data or false if the extraction fails.
*/
function extractEventData(oMsg, config, isEnabled) {
  const searchRegex = config.searchRegex;
  const method = config.method || '$.method';

  if (!new RegExp(searchRegex).test(JSON.stringify(oMsg))) {
    return false;
  }

  const extractedMethod = JSONPath.query(oMsg, method);

  if (extractedMethod.length === 0) {
    logger.debug(`Error occurred while extracting event data: No method found in the provided message.`);
    return false;
  }

  const methodName = extractedMethod[0];
  const metadata = {
    registration: {},
    unRegistration: {},
    method: methodName
  };

   // If isEnabled is true, add oMsg to metadata.registration
   if (isEnabled) {
    metadata.registration = oMsg;
  } else {
    // If isEnabled is false, add oMsg to metadata.unRegistration
    metadata.unRegistration = oMsg;
  }

  return metadata;
}


/**
 * Determines if the given object message is an event listener message.
 * @param {object} oMsg - The object message to check.
 * @param {object} config - The configuration object to use.
 * @returns {boolean} - True if the message is an event listener message, false otherwise.
*/
function isEventListenerMessage(oMsg, config) {
  // Call extractEventData and store the result
  const eventData = extractEventData(oMsg, config);
  
  return (eventData !== false);
}

/**
 * Determines whether the given message is intended to enable an event listener.
 * A regex pattern and JSON path are provided in config to check whether the event listener is on.
 * @param {Object} oMsg - The incoming message to check.
 * @return {boolean} - Returns `true` if the message is intended to enable an event listener, `false` otherwise.
 */
function isEventListenerOnMessage(oMsg) {
  return isEventListenerMessage(oMsg, eventConfig.registrationMessage);
}

/**
 * Determines whether the given message is intended to disable an event listener.
 * A regex pattern and JSON path are provided in config to check whether the event listener is off.
 * @param {Object} oMsg - The incoming message to check.
 * @return {boolean} - Returns `true` if the message is intended to disable an event listener, `false` otherwise.
 */
function isEventListenerOffMessage(oMsg) {
  return isEventListenerMessage(oMsg, eventConfig.unRegistrationMessage);
}

/**
 * Respond to an event listener request with an ack
 * @param {string} userId - The user ID for whom the ack message is sent.
 * @param {WebSocket} ws - The WebSocket instance to which the ack message will be sent.
 * @param {object} metadata - The metadata associated with the event listener request.
 * @returns {void}
 * @example
   For request:
   {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
   Send ack response:
   {"jsonrpc":"2.0","result":{"listening":true, "event":"lifecycle.onInactive"},"id":1}
*/
function sendEventListenerAck(userId, ws, metadata) {
  const template = hbs.compile(eventConfig.registrationAck);
  const ackMessage = template(metadata);
  const parsedAckMessage = JSON.parse(ackMessage);

  ws.send(ackMessage);
  logger.debug(`Sent registration event ack message for user ${userId}: ${ackMessage}`);
  updateCallWithResponse(metadata.method, parsedAckMessage.result, "result", userId)
}

/**
 * Respond to an unregistration event with an ack
 * @param {string} userId - The user ID for whom the ack message is sent.
 * @param {WebSocket} ws - The WebSocket instance to which the ack message will be sent.
 * @param {object} metadata - The metadata associated with the unregistration event.
 * @returns {void}
 * @example
   For request:
   {"jsonrpc":"2.0","method":"lifecycle.onInactive","params":{"listen":true},"id":1}
   Send ack response:
   {"jsonrpc":"2.0","result":{"listening":true, "event":"lifecycle.onInactive"},"id":1}
*/
function sendUnRegistrationAck(userId, ws, metadata) {
  const template = hbs.compile(eventConfig.unRegistrationAck);
  const ackMessage = template(metadata);

  ws.send(ackMessage);
  logger.debug(`Sent unregistration event ack message for user ${userId}: ${ackMessage}`)
}

function sendEvent(ws, userId, method, result, msg, fSuccess, fErr, fFatalErr){
  coreSendEvent(false, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr);
}

function sendBroadcastEvent(ws, userId, method, result, msg, fSuccess, fErr, fFatalErr){
  coreSendEvent(true, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr);
}

/**
 * Emits a response to the registered event listener.
 * @param {any} finalResult - The final result to be included in the response.
 * @param {string} msg - The message associated with the response.
 * @param {string} userId - The ID of the user.
 * @param {string} method - The method associated with the event.
 * @returns {void}
*/
function emitResponse(finalResult, msg, userId, method) {
  const listener = getRegisteredEventListener(userId, method);
  if (!listener) {
    logger.debug('Event message could not be sent because a listener was not found');
    return;
  }

  const { metadata, wsArr } = listener;
  // Defines the data object that will be inputted into handlebars
  const templateData = {
    ...metadata,
    result: finalResult,
    resultAsJson: JSON.stringify(finalResult)
  };

  let eventMessage;

  // If event template config exists, use it
  if (eventConfig.event) {
    const template = hbs.compile(eventConfig.event);
    eventMessage = template(templateData);
  } else {
    // If event template config does not exist, just send the raw finalResult
    eventMessage = finalResult;
  }
  //Update the call with event response
  updateCallWithResponse(method, eventMessage, "events", userId);
  wsArr.forEach((ws) => {
    ws.send(eventMessage);
    // Check if eventType is included in config
    if (eventConfig.eventType) {
      logger.info(`${msg}: Sent ${eventConfig.eventType} message to user ${userId}: ${eventMessage}`);
    } else {
      logger.info(`${msg}: Sent event message to user ${userId}: ${eventMessage}`);
    }
  });
}

// sendEvent to handle post API event calls, including pre- and post- event trigger processing
function coreSendEvent(isBroadcast, ws, userId, method, result, msg, fSuccess, fErr, fFatalErr) {
    let methodName = method;
    if (config.app.allowMixedCase) {
        methodName = method.toLowerCase();
    }
  try {
    if (  ! isBroadcast && !isRegisteredEventListener(userId, methodName) ) {
      logger.info(`${methodName} event not registered`);
      fErr.call(null, methodName);

    } else if ( isBroadcast && !isAnyRegisteredInGroup(userId, methodName) ){
      logger.info(`${methodName} event not registered`);
      fErr.call(null, methodName);

    } else {
       // Fire pre trigger if there is one for this method
       if ( methodName in eventTriggers ) {
        if ( 'pre' in eventTriggers[methodName] ) {
          try {
            const ctx = {
              logger: logger,
              setTimeout: setTimeout,
              setInterval: setInterval,
              set: function ss(key, val, scope) { return stateManagement.setScratch(userId, key, val, scope) },
              get: function gs(key) { return stateManagement.getScratch(userId, key); },
              delete: function ds(key, scope) { return stateManagement.deleteScratch(userId, key, scope)},
              uuid: function cuuid() {return stateManagement.createUuid()},
              sendEvent: function(methodName, result, msg) {
                sendEvent( ws, userId, methodName, result, msg, logSuccess.bind(this, methodName, result, msg), logErr.bind(this, methodName), logFatalErr.bind(this) );
              },
              sendBroadcastEvent: function(onMethod, result, msg) {
                sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
              }
            };
            logger.debug(`Calling pre trigger for event ${methodName}`);
            eventTriggers[methodName].pre.call(null,ctx);
          } catch ( ex ) {
            logger.error(`ERROR: Exception occurred while executing pre-trigger for ${methodName}; continuing`);
          }
        }
      }

      const response = {result : result};
      let postResult;
      
      // Fire post trigger if there is one for this methodName
      if ( methodName in eventTriggers ) {
        if ( 'post' in eventTriggers[methodName] ) {
          try {
            const ctx = {
              logger: logger,
              setTimeout: setTimeout,
              setInterval: setInterval,
              set: function ss(key, val, scope) { return stateManagement.setScratch(userId, key, val, scope) },
              get: function gs(key) { return stateManagement.getScratch(userId, key); },
              delete: function ds(key, scope) { return stateManagement.deleteScratch(userId, key, scope)},
              uuid: function cuuid() {return stateManagement.createUuid()},
              sendEvent: function(methodName, result, msg) {
                sendEvent( ws, userId, methodName, result, msg, logSuccess.bind(this, methodName, result, msg), logErr.bind(this, methodName), logFatalErr.bind(this) );
              },
              sendBroadcastEvent: function(onMethod, result, msg) {
                sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
              },
              ...response
            };
            logger.debug(`Calling post trigger for event ${methodName}`);
            // post trigger can return undefined to leave as-is or can return a new result object
            postResult = eventTriggers[methodName].post.call(null, ctx);
          } catch ( ex ) {
            {
              logger.error(`ERROR: Exception occurred while executing post-trigger for ${methodName}`);
              logger.error(ex);
            }
          }
        }
      }

      const finalResult = ( postResult ? postResult : result );
      // Error to be logged in "novalidate mode" if result validation failed
      if( config.validate.includes("events") ) {
        const resultErrors = fireboltOpenRpc.validateMethodResult(finalResult, methodName);
        if ( resultErrors && resultErrors.length > 0 ) {
          fErr.call(null, methodName);
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
            emitResponse(finalResult, msg, userWithSameGroup, methodName);
          });
          fSuccess.call(null);
        } else {
          // Internal error
          const msg = 'sendEvent: ERROR: Internal Error: No sockets in list';
          throw new Error(msg);
        }
      } else {
        emitResponse(finalResult, msg, userId, methodName);
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
  emitResponse, 
  extractEventData,
  isEventListenerOnMessage,
  isEventListenerOffMessage
}

export {
  registerEventListener, deregisterEventListener,
  isEventListenerOnMessage, isEventListenerOffMessage,
  sendEventListenerAck, sendUnRegistrationAck,
  sendEvent, sendBroadcastEvent, logSuccess, logErr,
  logFatalErr, extractEventData
};
