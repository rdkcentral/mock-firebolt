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

// WebSocket for forwarding keys from Conduit app on device to app under development on developer's machine

'use strict';

import WebSocket, { WebSocketServer } from 'ws';
import { config } from './config.mjs';
import * as commandLine from './commandLine.mjs';

const conduitKeySocketPort = commandLine.conduitKeySocketPort;
let keySocket;

if (commandLine.conduit) {
  const wss = new WebSocketServer({ port: conduitKeySocketPort });

  wss.on('connection', function connection(ws) {
    keySocket = ws;
    // No need for ws.on('message', function message(data) {...}) because this socket is for sending from here only
  });

  console.log(`Listening on socket port ${conduitKeySocketPort} (key forwarding from Conduit app to app under development)...`);
}

function getKeySocket() {
  return keySocket;
}

export {
  getKeySocket
};
