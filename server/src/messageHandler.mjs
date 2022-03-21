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

// OpenRPC message handler function / logic

'use strict';

import { logger } from './logger.mjs';
import * as util from './util.mjs';
import * as fireboltOpenRpc from './fireboltOpenRpc.mjs';
import * as stateManagement from './stateManagement.mjs';
import * as events from './events.mjs';
import { triggers } from './messageHandlerTriggers.mjs';

function emit(id, result, msg, ws) {
  if ( id ) {
    const oEventMessage = {
      jsonrpc: '2.0',
      id: id,
      result: result
    };
    const eventMessage = JSON.stringify(oEventMessage);
    ws.send(eventMessage);
    logger.info(`${msg}: ${eventMessage}`);
  }
}

// Process given message and send any ack/reply to given web socket connection
async function handleMessage(message, userId, ws) {
  logger.debug(`Received message: ${message}`);

  const oMsg = JSON.parse(message);

  // Handle JSON-RPC notifications (w/ no id in request)
  // - Don't send reply message over socket back to SDK
  if ( ! 'id' in oMsg) {
    logger.info('Not responding, since that message was a notification with no id');
    return;
  }

  // Handle JSON-RPC messages that are event listener enable requests
  if ( events.isEventListenerOnMessage(oMsg) ) {
    events.sendEventListenerAck(ws, oMsg);
    events.registerEventListener(oMsg);
    return;
  }
  
  // Handle JSON-RPC messages that are event listener disable requests
  if ( events.isEventListenerOffMessage(oMsg) ) {
    events.deregisterEventListener(oMsg);
    return;
  }

  // Handle JSON-RPC message that is somehow for an unknown method
  if ( ! fireboltOpenRpc.isMethodKnown(oMsg.method) ) {
    // Somehow, we got a socket message representing a Firebolt method call for a method name we don't recognize!
    logger.error(`ERROR: Method ${oMsg.method} called, but there is no such method in the Firebolt API OpenRPC specification`);
    const oResponseMessage = {
      jsonrpc: '2.0',
      id: oMsg.id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    };
    const responseMessage = JSON.stringify(oResponseMessage);
    // No delay
    ws.send(responseMessage);
    logger.info(`Sent "method not found" message: ${responseMessage}`);
    return;
  }

  // We got a socket message representing a Firebolt method call for a method name we know about

  // Handle JSON-RPC message representing a bad "call" (params invalid)
  const callErrors = fireboltOpenRpc.validateMethodCall(oMsg.method, oMsg.params);
  if ( callErrors && callErrors.length > 0 ) {
    // We got a socket message representing an invalid Firebolt method call (bad params)
    logger.error(`ERROR: Method ${oMsg.method} called, but caller's params are invalid`);
    logger.error(JSON.stringify(callErrors, null, 4));
    const oResponseMessage = {
      jsonrpc: '2.0',
      id: oMsg.id,
      error: {
        code: -32400,                  // @TODO: Ensure we're returning the right value and message
        message: 'Invalid parameters', // @TODO: Ensure we're returning the right value and message
        data: {
          errors: callErrors           // @TODO: Ensure we're formally defining this schema / data value
        }
      }
    };
    const responseMessage = JSON.stringify(oResponseMessage);
    // No delay
    ws.send(responseMessage);
    logger.info(`Sent "invalid params" message: ${responseMessage}`);
  }

  // Fire pre trigger if there is one for this method
  let shouldContinue;
  if ( oMsg.method in triggers ) {
    if ( 'pre' in triggers[oMsg.method] ) {
      try {
        const ctx = {
          setTimeout: setTimeout,
          setInterval: setInterval,
          sendEvent: function(onMethod, result, msg) {
            const id = events.getRegisteredEventListener(onMethod);
            if ( ! id ) { return; }
            emit(id, result, msg, ws);
          }
        };
        shouldContinue = triggers[oMsg.method].pre.call(null, ctx, oMsg.params);
      } catch ( ex ) {
        logger.error(`ERROR: Exception occurred while executing pre-trigger for ${oMsg.method}; not continuing`);
        shouldContinue = false;
      }
      if ( ! shouldContinue ) {
        return;
      }
    }
  }

  // Handle Firebolt Method call using our in-memory mock values and/or default defaults (from the examples in the Open RPC specification)
  const response = stateManagement.getMethodResponse(userId, oMsg.method, oMsg.params);
  const oResponseMessage = {
    jsonrpc: '2.0',
    id: oMsg.id,
    ...response  // layer in either a 'result' key and value or an 'error' key and a value like { code: xxx, message: xxx }
  };
  const responseMessage = JSON.stringify(oResponseMessage);
  const dly = stateManagement.getAppropriateDelay(userId, oMsg.method);
  await util.delay(dly);
  ws.send(responseMessage);
  logger.debug(`Sent message: ${responseMessage}`);

  // Fire post trigger if there is one for this method
  if ( oMsg.method in triggers ) {
    if ( 'post' in triggers[oMsg.method] ) {
      try {
        const ctx = {
          setTimeout: setTimeout,
          setInterval: setInterval,
          sendEvent: function(onMethod, result, msg) {
            const id = events.getRegisteredEventListener(onMethod);
            if ( ! id ) { return; }
            emit(id, result, msg, ws);
          }
        };
        triggers[oMsg.method].post.call(null, ctx, oMsg.params);
      } catch ( ex ) {
        logger.error(`ERROR: Exception occurred while executing post-trigger for ${oMsg.method}`);
        logger.error(ex);
      }
    }
  }
}

// --- Exports ---

export {
  handleMessage
};
