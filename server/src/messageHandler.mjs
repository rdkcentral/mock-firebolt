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

import * as commonErrors from './commonErrors.mjs';
import { logger } from './logger.mjs';
import * as util from './util.mjs';
import * as fireboltOpenRpc from './fireboltOpenRpc.mjs';
import * as stateManagement from './stateManagement.mjs';
import { methodTriggers } from './triggers.mjs';
import {
  isEventListenerOnMessage,
  sendEventListenerAck,
  registerEventListener,
  deregisterEventListener,
  isEventListenerOffMessage,
  sendBroadcastEvent,
  sendEvent,
  logSuccess,
  logErr,
  logFatalErr,
} from "./events.mjs";
import { addCall, updateCallWithResponse } from './sessionManagement.mjs';
import * as proxyManagement from './proxyManagement.mjs'

// Process given message and send any ack/reply to given web socket connection
async function handleMessage(message, userId, ws) {
  let response, newResponse;
  
  logger.debug(`Received message: ${message}`);

  const oMsg = JSON.parse(message);

  // record the message if we are recording
  addCall(oMsg.method, oMsg.params);

  // Handle JSON-RPC notifications (w/ no id in request)
  // - Don't send reply message over socket back to SDK
  if ( ! ('id' in oMsg)) {
    logger.info('Not responding, since that message was a notification with no id');
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
    updateCallWithResponse(oMsg.method, oResponseMessage.error, "error")
    return;
  }

  // Handle JSON-RPC messages that are event listener enable requests
  if ( isEventListenerOnMessage(oMsg) ) {
    sendEventListenerAck(ws, oMsg);
    registerEventListener(userId, oMsg);
    return;
  }

  // Handle JSON-RPC messages that are event listener disable requests
  if ( isEventListenerOffMessage(oMsg) ) {
    deregisterEventListener(userId, oMsg);
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
    updateCallWithResponse(oMsg.method, oResponseMessage.error, "error")
  }

  // Fire pre trigger if there is one for this method  
  if ( oMsg.method in methodTriggers ) {
    if ( 'pre' in methodTriggers[oMsg.method] ) {
      try {
        const ctx = {
          logger: logger,
          setTimeout: setTimeout,
          setInterval: setInterval,
          set: function ss(key, val) { return stateManagement.setScratch(userId, key, val) },
          get: function gs(key) { return stateManagement.getScratch(userId, key); },
          sendEvent: function(onMethod, result, msg) {
            sendEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
          },
          sendBroadcastEvent: function(onMethod, result, msg) {
            sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
          }
        };
        logger.debug(`Calling pre trigger for method ${oMsg.method}`);
        methodTriggers[oMsg.method].pre.call(null, ctx, oMsg.params);
      } catch ( ex ) {
        logger.error(`ERROR: Exception occurred while executing pre-trigger for ${oMsg.method}; continuing`);       
      } 
    }
  }

  if ( stateManagement.hasOverride(userId, oMsg.method) ) {
    // Handle Firebolt Method call using our in-memory mock values
    logger.debug(`Retrieving override mock value for method ${oMsg.method}`);
    response = stateManagement.getMethodResponse(userId, oMsg.method, oMsg.params); // Could be optimized cuz we know we want an override response
  } else if ( process.env.proxy ) {
    //bypass JSON-RPC calls and hit proxy server endpoint
    let wsProxy = await proxyManagement.getProxyWSConnection()
    if( ! wsProxy ) {
      //init websocket connection for proxy request to be sent and update receiver client to send request back to caller.
      try {
        wsProxy = await proxyManagement.initialize() 
      } catch (err) {
        logger.error(`ERROR: Unable to establish proxy connection due to ${err}`)
        process.exit(1)
      }
    }
    response = await proxyManagement.sendRequest(JSON.stringify(oMsg))
  } else {
    //  Fetching response from in-memory mock values and/or default defaults (from the examples in the Open RPC specification)
    logger.debug(`Returning default mock value for method ${oMsg.method}`);
    response = stateManagement.getMethodResponse(userId, oMsg.method, oMsg.params, ws);
  }

  // Emit developerNotes for the method, if any
  const developerNotes = fireboltOpenRpc.getDeveloperNotesForMethod(oMsg.method);
  if ( developerNotes ) {
    //logger.warning('\n');
    logger.warning(`Developer notes for function ${oMsg.method}:`);
    if ( developerNotes.notes ) {
      logger.warning(developerNotes.notes);
    }
    if ( developerNotes.docUrl ) {
      logger.warning(`Documentation links:`);
      logger.warning(developerNotes.docUrl);
    }
    //logger.warning('\n');
  }

  // Fire post trigger if there is one for this method
  if ( oMsg.method in methodTriggers ) {
    if ( 'post' in methodTriggers[oMsg.method] ) {
      try {
        const ctx = {
          logger: logger,
          setTimeout: setTimeout,
          setInterval: setInterval,
          set: function ss(key, val) { return stateManagement.setScratch(userId, key, val) },
          get: function gs(key) { return stateManagement.getScratch(userId, key); },
          sendEvent: function(onMethod, result, msg) {
            sendEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
          },
          sendBroadcastEvent: function(onMethod, result, msg) {
            sendBroadcastEvent( ws, userId, onMethod, result, msg, logSuccess.bind(this, onMethod, result, msg), logErr.bind(this, onMethod), logFatalErr.bind(this) );
          },
          ...response  // As returned either by the mock override or via Conduit from a real device
        };
        logger.debug(`Calling post trigger for method ${oMsg.method}`);
        // post trigger can return undefined to leave as-is or can return a new response object
        newResponse = methodTriggers[oMsg.method].post.call(null, ctx, oMsg.params);

        // If there is one, make the real Firebolt response look like our normal response objects (with a result key or error key)
        if ( newResponse !== undefined ) {
          if ( typeof newResponse === 'object' && newResponse.hasOwnProperty('code') && newResponse.hasOwnProperty('message') ) {
            newResponse = {
              error: newResponse
            };
          } else {
            newResponse = {
              result: newResponse
            };
          }
        }
      } catch ( ex ) {
        if ( ex instanceof commonErrors.FireboltError ) {
          // Looks like the function threw a FireboltError, which means we want to mock an error, not a result
          newResponse = {
            error: { code: ex.code, message: ex.message }
          }
        } else {
          logger.error(`ERROR: Exception occurred while executing post-trigger for ${oMsg.method}`);
          logger.error(ex);
          newResponse = undefined;
        }
      }
    }
  }

  // Send client app back a message with the response to their Firebolt method call

  logger.debug(`Sending response for method ${oMsg.method}`);
  let finalResponse = ( newResponse ? newResponse : response );
  if( ! process.env.proxy ) {
    const oResponseMessage = {
      jsonrpc: '2.0',
      id: oMsg.id,
      ...finalResponse  // layer in either a 'result' key and value or an 'error' key and a value like { code: xxx, message: xxx }
    };
    finalResponse = JSON.stringify(oResponseMessage);
  } 
  const dly = stateManagement.getAppropriateDelay(userId, oMsg.method);
  await util.delay(dly);
  ws.send(finalResponse);
  logger.debug(`Sent message for user ${userId}: ${finalResponse}`);
  updateCallWithResponse(oMsg.method, JSON.parse(finalResponse).result, "result")
}

// --- Exports ---

export {
  handleMessage
};