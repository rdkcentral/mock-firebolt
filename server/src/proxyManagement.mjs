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

async function initialize() {
    const url = await buildWSUrl()
    if (url) {
      console.log("Establishing proxy connection which would forward request to websocket server")
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
              websocketConnection = ws
          }

          ws.onclose = function(){
              // connection closed, discard old websocket and create a new one in 2s
              console.log("Connection to websocket proxy server is closed.")
              ws = null
              websocketConnection = null
              setTimeout(function() {
                  console.log("Reinitialize websocket proxy connection")
                  initialize(receiverWSClient);
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

function getProxyWSConnection() {
    return websocketConnection
}

function sendRequest(payload) {
  return new Promise((res, rej) => {
    const ws = getProxyWSConnection()
    if (!ws) {
        throw new Error("websocketConnection not established")
    }
    waitForSocketConnection(ws, function(socket){
          socket.addEventListener('error', function(event) {
            rej(event.data)
          })
    
          let websocket = socket
          let sendCallback = function(event) {
            websocket.removeEventListener('message', sendCallback)
            websocket.removeEventListener('error', sendCallback)
            res(event.data)
          }
    
          socket.addEventListener('message', sendCallback)
          socket.send(payload)
          console.log("Request sent to device/server: ", payload);
      })
    });
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback){
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
                console.log("Wait for connection...")
                waitForSocketConnection(socket, callback);
            }
        }, 1000); // wait 1 second for the connection...
}

function buildWSUrl() {
    return new Promise(resolve => {
        //support wss and ws
        const wsUrlProtocol = 'ws://'
        const port = 9998
        const path = '/jsonrpc'
        const deviceHost = process.env.thunderIP
        resolve([
            wsUrlProtocol,
            deviceHost,
            ':' + port,
            path,
            process.env.wsToken ? '?token=' + process.env.wsToken : null,
        ].join(''))
    })    
}

function close() {
  if(websocketConnection) {
    websocketConnection.close()
    websocketConnection = null
  }
}

// Return thunder token from actual device for ws connection
function getThunderToken(request) {
    return new Promise(async (resolve) => {
      let output = {
        stdout: '',
        stderr: '',
      };
      // If token already exists, return token
      if(process.env.wsToken) {
        output.stdout = process.env.wsToken
        resolve(output)
      }
      const { query } = parse(request.url);
      if(query && query.includes("token=") && query.length > 6) {
        const token = query.split('token=').pop().split('&')[0];
        output.stdout = token
        resolve(output)
      } else {
        output.stderr = "Unable to get token from connection param or not present in env"
        resolve(output)
      }
    })
}

export {
    getThunderToken, initialize, getProxyWSConnection, sendRequest, close
};