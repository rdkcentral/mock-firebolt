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

import { logger } from './logger.mjs';

// Maps event listener request method name (e.g., lifecycle.onInactive) to message id (e.g., 17)
const eventListenerMap = {};

// Associate this message ID with this method so if/when events are sent, we know which message ID to use
function registerEventListener(oMsg) {
  eventListenerMap[oMsg.method] = oMsg.id;
  logger.debug(`Registered event listener mapping: ${oMsg.method}:${oMsg.id}`);
}

function isRegisteredEventListener(method) {
  return ( method in eventListenerMap );
}

function getRegisteredEventListener(method) {
  console.log(eventListenerMap);
  return eventListenerMap[method];
}

// Remove mapping from event listener request method name from our map
// Attempts to send events to this listener going forward will fail
function deregisterEventListener(oMsg) {
  delete eventListenerMap[oMsg.method];
  logger.debug(`Deregistered event listener for method: ${oMsg.method}`);
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
}

// --- Exports ---

export {
  registerEventListener, isRegisteredEventListener, getRegisteredEventListener, deregisterEventListener,
  isEventListenerOnMessage, isEventListenerOffMessage,
  sendEventListenerAck
};
