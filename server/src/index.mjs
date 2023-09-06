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

// Mock Firebolt - main entry point

'use strict';

import './developerTools.mjs';
import { logger } from './logger.mjs';
import { config } from './config.mjs';
import * as commandLine from './commandLine.mjs';
import { getUserIdFromReq } from './util.mjs';
import * as userManagement from './userManagement.mjs';
import * as stateManagement from './stateManagement.mjs';
import * as proxyManagement from './proxyManagement.mjs';
import * as sessionManagement from './sessionManagement.mjs';

// --------------------------------------------------- Conduit ----------------------------------------------------

import './conduit.mjs';
import './conduitKeys.mjs';

// ------------------------------------------ Firebolt OpenRPC WebSocket ------------------------------------------

import { createServer } from 'http';
import { parse } from 'url';

logger.important(`Welcome to Mock Firebolt`);

const server = createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  let userId = pathname.substring(1);

  if ( ! userId ) {
    logger.info('Using default user');
    userId = config.app.defaultUserId;
  } else if ( ! userManagement.isKnownUser(userId) ) {
    logger.warn(`WARNING: Unknown userId: ${userId}; Using default user`);
    userId = config.app.defaultUserId;
  } else {
    logger.info(`Using user ${userId}`);
  }
  
  if( commandLine.proxy ) {
    process.env.proxyServerIP = commandLine.proxy
    logger.info('Send proxy request to websocket server: ' + process.env.proxyServerIP);
    process.env.proxy = true
    // Get token from connection parameter or from env
    const mfToken = proxyManagement.getMFToken(request)
    if( mfToken.token ) {
      process.env.wsToken = mfToken.token
    } else {
      logger.warn(`WARNING: ${mfToken.error}`);
    }
  }

  const wss = userManagement.getWssForUser(userId);
  if ( wss ) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  } else {
    logger.error(`ERROR: Unknown userId: ${userId}`);
    socket.destroy();
  }
});

// Starter user(s)
stateManagement.addUser('123~A'); userManagement.addUser('123~A');
stateManagement.addUser('567~B'); userManagement.addUser('567~B');
// adding one extra group B user
stateManagement.addUser('978~B'); userManagement.addUser('978~B');
stateManagement.addUser('456~A'); userManagement.addUser('456~A');
stateManagement.addUser('789~A'); userManagement.addUser('789~A');

server.listen(commandLine.socketPort);
logger.info(`Listening on socket port ${commandLine.socketPort}...`);

// ----------------------------------------------------- HTTP -----------------------------------------------------

import path from 'path';
const __dirname = path.resolve();
import express from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import cors from 'cors';

import * as configureAPI from './configureAPI.mjs';
import * as configureUI from './configureUI.mjs';

const app = express();

app.use(bodyParser.json({ limit: '1mb' })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({             // to support URL-encoded bodies
  extended: true
}));
app.use(cors());
app.options('*',cors());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));

// Make the correct ws connection available to routes
app.use(function(req, res, next) {
  const userId = getUserIdFromReq(req);
  res.locals.ws = userManagement.getWsForUser(userId);
  next();
});

configureAPI.configureAPI(app);
configureUI.configureUI(app);

app.get('*', function(req, res) {
  res.status(200).send('You seem lost');
});

app.listen(commandLine.httpPort);
logger.info(`Listening on HTTP port ${commandLine.httpPort}...`);
logger.info(`Default users loaded: [ ${userManagement.getUsers()} ]`);

// ----------------------------------------------- Session WS Server ----------------------------------------------

import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

export const wss = new WebSocketServer({ port: commandLine.wsSessionServerPort });

logger.info(`Listening on session server port ${commandLine.wsSessionServerPort}...`);

// What occurs on connection
wss.on('connection', (ws, req) => {
    const userIdFromUrl = req.url.substring(1);
    const userId = userIdFromUrl ? userIdFromUrl : uuidv4();
  
    if (userIdFromUrl) {
      logger.info(`Websocket connection established to listen for session activity for user: ${userId}`);
    } else {
      logger.info(`Websocket connection established to listen to all available user sessions while recording`);
    }

  sessionManagement.associateUserWithSessionWsMap(userId, ws);

  ws.send(`You have successfully connected to the MF Session Websocket Server. Please make sure you start a session to begin receving messages.`)

  // What occurs on disconnection
  ws.on('close', () => {
    logger.info(`Client has disconnected...`);
    sessionManagement.removeUserFromSessionWsMap(userId)
  });
});  
