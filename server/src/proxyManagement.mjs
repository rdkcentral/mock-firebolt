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

const wsMap = new Map()
let closeConnectionTrigger = false

async function initializeAndSendRequest(returnWs, command) {
  const oneToOneWs = wsMap.get(returnWs)
  let ws = null

  /* Checks to see if ws connection is in map.
   * If connection exists, it will be used.
   * Else, a new connection will be created.
  */
  if(oneToOneWs) {
    ws = oneToOneWs
    // Should maybe check to make sure connection is alive otherwise delete the connection and start again?
    ws.send(command)
  } else {
    const url = buildWSUrl()
    ws = new WebSocket(url)
  }

  try {
    return new Promise((res, rej) => {
      ws.on('open', function open() {
        console.log("Connection establised, sending incoming request to proxy.")
        ws.send(command)
        // Add ws connection to map
        wsMap.set(returnWs, ws)
      });

      ws.on('close', function close() {
        console.log('disconnected');
      });
      
      ws.on('message', function message(data) {
        const buf = Buffer.from(data, 'utf8');
        const response = JSON.parse(buf.toString())

        if (response.id === undefined) {
          // In case of event, send the event directly to the caller.
          returnWs.send(buf.toString())
        } else {
          // if(!closeConnectionTrigger) {
          //   closeConnectionTrigger = true
          //   // Close connection with given interval
          //   closeStaleConnection(returnWs)
          // }
          res(buf.toString())
        }
      });

      ws.on('error', function message(err) {
        rej(err)
      });
    })
  } catch (err) {
    return err
  }
}

function closeStaleConnection(mapKey) {
  let timeout = 1000
  let counter = 0
  let interval = 100
  let timer = setInterval(function() {
  // Logic in here needs to be reworked
  // What I think needs to be done is kill the connection
  // if the counter >= timeout

    const wsConn = wsMap.get(mapKey)

    if(counter >= timeout) {
      wsMap.set(mapKey, null)
    }
    counter = counter + interval
  }, interval);
}

function buildWSUrl() {
  let proxyUrl = process.env.proxyServerIP
  if( ! proxyUrl ) {
    throw Error('ERROR: Proxy Url not found in env')
  } else if ( ! proxyUrl.includes(":") ) {
    proxyUrl = proxyUrl + ":" + 9998
  }
  //support ws
  const wsUrlProtocol = 'ws://'
  const path = '/jsonrpc'
  const hostPort = proxyUrl
  return [wsUrlProtocol, hostPort, path, process.env.MF_TOKEN ? '?token=' + process.env.MF_TOKEN : null,
  ].join('')
}

// Get token from request param or env variable
function getMFToken(request) {
  let output = {
    token: '',
    error: '',
  };
  // If token already exists, return token
  if(process.env.MF_TOKEN) {
    output.token = process.env.MF_TOKEN
    return output
  }
  const { query } = parse(request.url);
  if(query && query.includes("token=") && query.length > 6) {
    const token = query.split('token=').pop().split('&')[0];
    output.token = token
    return output
  } else {
    output.error = "Unable to get token from connection param or not present in env"
    return output
  }
}

// --- Exports ---
export {
  getMFToken, initializeAndSendRequest
};