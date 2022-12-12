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

// Configure API routes

'use strict';

import * as healthApi from './routes/api/health.mjs';
import * as metaApi from './routes/api/meta.mjs';
import * as stateApi from './routes/api/state.mjs';
import * as userApi from './routes/api/user.mjs';
import * as eventApi from './routes/api/event.mjs';
import * as sessionApi from './routes/api/session.mjs';
import * as sequenceApi from './routes/api/sequence.mjs';
import * as statusApi from './routes/api/status.mjs';
function configureAPI(app) {

	// =========================== Health Check Route =========================

	// Health check endpoint
	app.get('/api/v1/healthcheck',                      healthApi.healthcheck);

	// ======================== Debugging/Tooling Routes ======================

    // Get all OpenRPC metadata
    app.get('/api/v1/meta',                             metaApi.getMeta);

    // ======================= State-Related API Routes =======================
    
    // Set latency min and max, either globally or per method
    app.post('/api/v1/state/global/latency',            stateApi.setLatency);

    // Set mode
    app.post('/api/v1/state/global/mode',               stateApi.setMode);

    // Set success/normal response for method (result)
	app.post('/api/v1/state/method/:methodName/result', stateApi.setMethodResult);

	// Set error response for method (error with code and message)
	app.post('/api/v1/state/method/:methodName/error',  stateApi.setMethodError);

	// Set multiple state properties at once
	app.put ('/api/v1/state',                           stateApi.updateState);

    // Get current server state (global settings, scratch key-value pairs, and per-method overrides)
    app.get ('/api/v1/state',                           stateApi.getState);

	// Revert to the way things were when server started up
    app.post('/api/v1/state/revert',                    stateApi.revertState);

    // ======================= State-Related API Routes =======================

    app.post('/api/v1/user',                            userApi.addUser);

    // =======================  User-Related Routes ===========================

    app.get('/api/v1/user',                             userApi.getUsers);

	// ======================= Event-Related API Routes =======================

    // Send an event
    app.post('/api/v1/event',                           eventApi.sendEvent);

    // Broadcast an event
    app.post('/api/v1/broadcastEvent',                  eventApi.sendBroadcastEvent);

    // ======================= Session-Related API Routes =======================

    // Toggle session state
    app.post('/api/v1/session',                         sessionApi.toggleSession);

    // Start a session
    app.post('/api/v1/session/start',                   sessionApi.startSession);

    // End a session
    app.post('/api/v1/session/stop',                    sessionApi.stopSession);

    // Set session output format
    app.post('/api/v1/sessionoutput/:format',           sessionApi.setOutput);

    // Specifiy session output path
    app.post('/api/v1/sessionoutputpath',               sessionApi.setOutputPath);

    // ======================= Sequence-Related API Routes =======================

    // Send an event sequence
    app.post('/api/v1/sequence',                        sequenceApi.sendSequence);

     // check status
     app.get('/api/v1/status',                        statusApi.getStatus);
}

export { configureAPI };
