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

'use strict';

import { parse } from 'url';
import WebSocket from 'ws';
import { deleteWsOfUser } from './userManagement.mjs';

const wsMap = new Map();
const wsMsgMap = new Map();

async function sendRequest(returnWs, command, userId) {
  let outgoingWs = wsMap.get(returnWs);
  /* Checks to see if ws connection is in map.
   * If connection exists and is active, it will be used.
   * Else, a new connection will be created and mapped to returnWs.
   */

  // Set up listeners once and only once
  if (!outgoingWs) {
    outgoingWs = await setupOutgoingWs(returnWs, userId);

    outgoingWs.on('message', (data) => {
      const buf = Buffer.from(data, 'utf8');
      const response = JSON.parse(buf.toString());

      if (response.id === undefined) {
        // In case of event, send the event to caller directly.
        returnWs.send(buf.toString());
      } else {
        wsMsgMap.set(returnWs, buf.toString());
      }
    });
  }

  outgoingWs.send(command);

  return new Promise(async (res, rej) => {
    try {
      const response = await getResponseMessageFromProxy(returnWs);
      // Clear for next message
      wsMsgMap.set(returnWs, null);
      res(response);
    } catch (err) {
      rej('Timeout waiting for WS response.');
    }
  });
}

function setupOutgoingWs(returnWs, userId) {
  const url = buildWSUrl();
  const ws = new WebSocket(url);
  try {
    return new Promise((res, rej) => {
      ws.on('open', function open() {
        console.log('Connection to websocket proxy server established.');
        // Add ws connection to map
        wsMap.set(returnWs, ws);
        res(ws);
      });

      ws.on('close', function close() {
        console.log('WS disconnected.');
        /* Remove closed connection from maps
         Deletes the websocket object for the closed connection from the impacted user's data
        */
        deleteWsOfUser(returnWs, userId)
        // Deletes the closed incoming and outgoing websocket object from map
        wsMap.delete(returnWs);
      });

      ws.on('error', function message(err) {
        rej(err);
      });
    });
  } catch (err) {
    return err;
  }
}

function getResponseMessageFromProxy(returnWs) {
  let timeout = 10000;
  let counter = 0;
  let interval = 100;
  return new Promise((res, rej) => {
    var timer = setInterval(function () {
      if (counter >= timeout) {
        console.log('Response not received for given returnWs.');
        rej(false);
      }

      const returnMsg = wsMsgMap.get(returnWs);
      if (returnMsg) {
        // Clear interval if response received for given returnWs
        clearInterval(timer);
        res(returnMsg);
      }
      counter = counter + interval;
    }, interval);
  });
}

function buildWSUrl() {
  let proxyUrl = process.env.proxyServerIP;
  if (!proxyUrl) {
    throw Error('ERROR: Proxy Url not found in env.');
  } else if (!proxyUrl.includes(':')) {
    proxyUrl = proxyUrl + ':' + 9998;
    console.log('Using the default port of 9998.')
  }
  // Support ws
  const wsUrlProtocol = 'ws://';
  const path = '/jsonrpc';
  const hostPort = proxyUrl;
  return [
    wsUrlProtocol,
    hostPort,
    path,
    process.env.MF_TOKEN ? '?token=' + process.env.MF_TOKEN : null,
  ].join('');
}

// Get token from request param or env variable
function getMFToken(request) {
  let output = {
    token: '',
    error: '',
  };
  // If token already exists, return token
  if (process.env.MF_TOKEN) {
    output.token = process.env.MF_TOKEN;
    return output;
  }
  const { query } = parse(request.url);
  if (query && query.includes('token=') && query.length > 6) {
    const token = query.split('token=').pop().split('&')[0];
    output.token = token;
    return output;
  } else {
    output.error = 'Unable to get token from connection param or not present in env.';
    return output;
  }
}

// --- Exports ---
export { getMFToken, sendRequest, deleteWsOfUser };
