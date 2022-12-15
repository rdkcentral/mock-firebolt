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
let websocketConnection = null;
const setTimeoutInterval = 1000
const connectionTimeout = 5000

async function initialize() {
  const url = await buildWSUrl()
  console.log(url)
  if (url) {
    try {
      let ws = new WebSocket(url)
      return new Promise((res, rej) => {
        let websocket = ws
        let openCallback = function(event) {
          websocket.removeEventListener('close', openCallback)
          websocket.removeEventListener('error', openCallback)
          res(event.data)
        }

        ws.addEventListener('error', function(event) {
          rej(event.data)
        })

        ws.addEventListener('close', function(event) {
          rej(event.data)
        })

        ws.addEventListener('open', openCallback)

        ws.onopen = function () {
          console.log("Connection to websocket proxy server established") 
          setProxyWSConnection(ws)
        }

        ws.onclose = function(){
            // connection closed, discard old websocket and create a new one in 2s
            console.log("Connection to websocket proxy server is closed.")
            ws = null
            //setProxyWSConnection(ws)
            setTimeout(function() {
                console.log("Reinitialize websocket proxy connection")
                initialize();
            }, 2000)
        }
      })
    } catch (err) {
      return err
    }
  } else {
    throw new Error("Cannot establish proxy connection. \"url\" with ws://host:port or wss://host:port required")
  }
}

function setProxyWSConnection(ws) {
  websocketConnection = ws
}

function getProxyWSConnection() {
    return websocketConnection
}

function sendRequest(payload) {
  return new Promise((res, rej) => {
    const ws = getProxyWSConnection()
    if ( ! ws ) {
        throw new Error("websocketConnection not established")
    }
    waitForSocketConnection(ws, 0, function(socket) {
      if(socket == null) {
        rej("Connection to proxy server timedout")
        return
      }

      let websocket = socket
      let sendCallback = function(event) {
        websocket.removeEventListener('message', sendCallback)
        websocket.removeEventListener('error', sendCallback)
        res(event.data)
      }

      socket.addEventListener('message', sendCallback)
      socket.send(payload)
      console.log("Request sent to proxy server: ", payload);
    })
  });
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, timeout, callback) {
  setTimeout(
    function () {
      if (socket.readyState === 1) {
          if (callback != null){
              callback(socket);
          }
      } else {
          if(getProxyWSConnection()) {
              socket = getProxyWSConnection()
          }
          console.log("Wait for connection... ")
          if(timeout >= connectionTimeout) {
            callback(null);
          } else {
            waitForSocketConnection(socket, timeout + 1000, callback);
          }
      }
  }, setTimeoutInterval); // wait 1 second for the connection...
}

function buildWSUrl() {
  let proxyUrl = process.env.proxyServerIP
  if( ! proxyUrl ) {
    throw Error('ERROR: Proxy Url not found in env')
  } else if ( ! proxyUrl.includes(":") ) {
    proxyUrl = proxyUrl + ":" + 9998
  }
  return new Promise(resolve => {
    //support ws
    const wsUrlProtocol = 'ws://'
    const path = '/jsonrpc'
    const hostPort = proxyUrl
    resolve([
        wsUrlProtocol,
        hostPort,
        path,
        process.env.MF_TOKEN ? '?token=' + process.env.MF_TOKEN : null,
    ].join(''))
  })
}

function close() {
  if(websocketConnection) {
    websocketConnection.close()
    websocketConnection = null
  }
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
  getMFToken, initialize, getProxyWSConnection, sendRequest, close, setProxyWSConnection
};