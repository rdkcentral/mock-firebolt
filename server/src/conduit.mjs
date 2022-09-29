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

// WebSocket for use with Conduit app on device

'use strict';

import WebSocket, { WebSocketServer } from 'ws';
import { config } from './config.mjs';
import * as userManagement from './userManagement.mjs';
import * as stateManagement from './stateManagement.mjs';
import * as events from './events.mjs';
import * as conduitKeys from './conduitKeys.mjs';
import * as commandLine from './commandLine.mjs';


let heartbeatInterval;    // JS Interval ID for heartbeat feature
let conduitWs;            // WebSocket used by Conduit to talk to Mock Firebolt
let conduitWss;

// Will (temporarily) hold Firebolt responses sent via the Conduit socket to a client
const fireboltResponses = {};  // openRpcMsg.id -> response via Conduit from a real Firebolt on a real device

const conduitSocketPort = commandLine.conduitSocketPort;

if (commandLine.conduit) {
  conduitWss = new WebSocketServer({ port: conduitSocketPort });

  conduitWss.on('error', (error) => {
    console.log('Conduit WebSocket Server Error:');
    console.log(error.message);
  });

  // Send pings from server to client to track whether client is alive
  // Terminates conduitWs if client isn't alive
  heartbeatInterval = setInterval(function ping() {
    conduitWss.clients.forEach(function each(conduitWs) {
      // Note the form of the expression; 'clientIsAlive' might not be present 1st time thru
      if ( conduitWs.clientIsAlive === false ) {
        console.log('Heartbeat processing discovered a dead client; terminating socket');
        return conduitWs.terminate();
      }

      conduitWs.clientIsAlive = false;
      const oConduitMsg = {
        from: 'mock-firebolt',
        type: 'PING-FROM-SERVER',
        data: undefined
      };
      const conduitMsg = JSON.stringify(oConduitMsg);
      conduitWs.send(conduitMsg);
      //Conduit WebSocket sent a ping message to client
    });
  }, 30000);

  conduitWss.on('connection', function connection(pConduitWs, request) {
    console.log('Conduit WebSocket Server received a connection event');
  
    conduitWs = pConduitWs;
  
    conduitWs.clientIssAlive = true;
  
    conduitWs.on('close', function socketClose(code, reason) {
      console.log(`Conduit WebSocket Close: ${code}: ${reason}`);
      for (const prop of Object.getOwnPropertyNames(fireboltResponses)) {
        delete fireboltResponses[prop];
      }
    });
  
    conduitWs.on('error', function socketError(error) {
      console.log('Conduit WebSocket Error:');
      console.log(error.message);
    });
  
    conduitWs.on('message', function socketMessage(data) {
      const str = String.fromCharCode.apply(null, new Uint16Array(data)); // Buf -> JSON String
      const oConduitMsg = JSON.parse(str); // JSON String -> Object
      // console.log('Conduit WebSocket received a message event:');
      // console.log(JSON.stringify(oConduitMsg, null, 4));
      handleConduitMessage(oConduitMsg);
    });
  });
  
  conduitWss.on('listening', function listening() {
    console.log('Conduit WebSocket Server received a listening event');
  });
  
  conduitWss.on('error', function error(err) {
    console.log('Conduit WebSocket Server received an error event:');
    console.log(err);
  });
  
  conduitWss.on('close', function close() {
    console.log('Conduit WebSocket Server received a close event');
    clearInterval(heartbeatInterval);
  });
  
  console.log(`Listening on socket port ${conduitSocketPort} (Conduit)...`);
}

function uc1(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

function handleConduitMessage(oConduitMsg) {
  if ( oConduitMsg.from !== 'conduit' ) {
    console.log('Conduit WebSocket received a message that was not from the conduit app... dropping');
    console.log(JSON.stringify(oConduitMsg, null, 4));
    return;
  }

  if ( oConduitMsg.type === 'PONG-FROM-CLIENT') {
    //console.log('Conduit WebSocket received a pong message from client');
    conduitWs.clientIsAlive = true;

  } else if ( oConduitMsg.type === 'FIREBOLT-LIFECYCLE-EVENT-FORWARD' || oConduitMsg.type === 'FIREBOLT-EVENT-FORWARD' ) {
    const ss = ( oConduitMsg.type === 'FIREBOLT-LIFECYCLE-EVENT-FORWARD' ? 'lifecycle' : 'non-lifecycle' );

    console.log(`Conduit WebSocket received a forwarded Firebolt ${ss} event message from client`);
    console.log(JSON.stringify(oConduitMsg, null, 4));

    try {
      const moduleName = oConduitMsg.data.moduleName;
      const eventName = oConduitMsg.data.eventName;
      const userId = oConduitMsg.userId || '12345';
      const ws = userManagement.getWsForUser(userId);
      const fullMethodName = moduleName + '.on' + uc1(eventName);
      const id = events.getRegisteredEventListener(fullMethodName);
      if ( id ) {
        const oOpenRpcMsg = {
          jsonrpc: '2.0',
          result: oConduitMsg.data.value,
          id: id
        };
        const openRpcMsg = JSON.stringify(oOpenRpcMsg);
        ws.send(openRpcMsg);
        console.log(`Conduit WebSocket forwarding ${ss} event to local app`);
        console.log(openRpcMsg);
      } else {
        console.log(`Ignoring forwarded Firebolt ${ss} event ${fullMethodName} because there is no event listener for it`);
      }
    } catch ( ex ) {
      console.log(`Error attempting to proces a forwarded Firebolt ${ss} event message from client`)
    }

  } else if ( oConduitMsg.type === 'FIREBOLT-RESPONSE' ) {
    console.log(`Conduit WebSocket received a Firebolt response event message from client: ${JSON.stringify(oConduitMsg)}`);

    // When the app under development made a Firebolt call, if/when Conduit is connected and the method called does
    // not have an override response specified, we sent the method call request to Conduit, which asked its real
    // Firebolt for an answer, and then returned it to us. Here we're processing the real Firebolt response from the Conduit
    // app. We just need to inform messageHandler.mjs::handleMessage (after sendMessageToConduit call) to stop slow polling done there
    // and then run through the final stretch of post trigger processing and ultimate return to the app under development
    if ( oConduitMsg.data.openRpcMsg.id ) {
      fireboltResponses[oConduitMsg.data.openRpcMsg.id] = oConduitMsg.data.openRpcMsg.result;
    } else {
      console.log(`INTERNAL ERROR: Received a FIREBOLT-RESPONSE with no id; strange`);
    }

  } else if ( oConduitMsg.type === 'KEYPRESS-FORWARD' ) {
    // We're receiving a forwarded keypress from the Conduit app on the device
    // Now we need to forward it to the app running locally
    console.log(`Conduit WebSocket received a forwarded keypress ${oConduitMsg.data.key} event message from client`);
    const keySocket = conduitKeys.getKeySocket();
    if ( keySocket ) {
      const keyMsg = {
        from: 'mock-firebolt',
        type: 'KEYPRESS-FORWARD',
        data: {
          key: oConduitMsg.data.key
        }
      };
      console.log(`Conduit WebSocket forwarding keypress ${oConduitMsg.data.key} event message to local app...`);
      keySocket.send(JSON.stringify(keyMsg));
      console.log(`Conduit WebSocket successfully sent keypress ${oConduitMsg.data.key} event message to local app`);
    } else {
      console.log(`Conduit WebSocket couldn't find key socket to forward keypress... dropping`);
    }

  } else if ( oConduitMsg.type === 'INITIAL-HANDSHAKE' ) {
    console.log('Conduit WebSocket received an initial handshake message from client');
    const oConduitResponseMsg = {
      from: 'mock-firebolt',
      type: 'INITIAL-HANDSHAKE-ACK',
      data: undefined
    };
    const conduitResponseMsg = JSON.stringify(oConduitResponseMsg);
    conduitWs.send(conduitResponseMsg);
    console.log('Conduit WebSocket sent a initial handshake ack message to client');

  } else {
    console.log('Conduit WebSocket received an unknown type of message... dropping');
    console.log(JSON.stringify(oConduitMsg, null, 4));
  }
}

function isConduitConnected() {
  if ( ! conduitWs ) { return false; }
  return true;
}

// openRpcMsg is the original message object ({ id: xxx, method: 'xxx', params: [ ... ] })
function sendMessageToConduit(openRpcMsg) {
  const oConduitMsg = {
    from: 'mock-firebolt',
    type: 'FIREBOLT-CALL-FROM-SERVER',
    userId: null, // @TODO?
    data: {
      openRpcMsg: openRpcMsg
    }
  };
  const conduitMsg = JSON.stringify(oConduitMsg);
  conduitWs.send(conduitMsg);
  console.log(`Sent a Firebolt method call message to Conduit: ${conduitMsg}`);
}

function getResponseFromConduit(openRpcMsg) {
  const response = fireboltResponses[openRpcMsg.id];
  if ( response ) {
    delete fireboltResponses[openRpcMsg.id]; // Keep our "hash" tidy/small
    return response;
  }
  return undefined;
}

export {
  isConduitConnected, sendMessageToConduit, getResponseFromConduit
};
