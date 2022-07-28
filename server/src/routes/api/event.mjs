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

// HTTP-based API routes: Event-Related

'use strict';

import { getUserIdFromReq } from '../../util.mjs';
import * as events from '../../events.mjs';

// --- Route Handlers ---

// POST /api/v1/event
// Expected body: { method: 'device.onDeviceNameChanged' result: ... }
function sendEvent(req, res) {
  const { ws } = res.locals; // Like magic!
  const userId = getUserIdFromReq(req);
  const { method, result } = req.body;

  function fSuccess() {
    res.status(200).send({
      status: 'SUCCESS'
    });
  }

  function fErr(method) {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'NO-EVENT-HANDLER-REGISTERED',
      message: `Could not send ${method} event because no listener is active`
    });
  }

  function fFatalErr(ex) {
    res.status(500).send({
      status: 'ERROR',
      errorCode: 'COULD-NOT-SEND-EVENT',
      message: 'Internal error',
      error: ex.toString()
    });
  }

  events.sendEvent(ws, userId, method, result, `${method}`, fSuccess, fErr, fFatalErr);
}

// POST /api/v1/broadcastEvent
// Expected body: { method: 'device.onDeviceNameChanged' result: ... }
function sendBroadcastEvent(req, res) {
  const { ws } = res.locals; // Like magic!
  const userId = getUserIdFromReq(req);
  const { method, result } = req.body;

  function fSuccess() {
    res.status(200).send({
      status: 'SUCCESS'
    });
  }

  function fErr(method) {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'NO-EVENT-HANDLER-REGISTERED',
      message: `Could not send ${method} event because no listener is active`
    });
  }

  function fFatalErr(ex) {
    res.status(500).send({
      status: 'ERROR',
      errorCode: 'COULD-NOT-SEND-EVENT',
      message: 'Internal error',
      error: ex.toString()
    });
  }

  events.sendBroadcastEvent(ws, userId, method, result, `${method}`, fSuccess, fErr, fFatalErr);
}

// --- Exports ---

export {
  sendEvent, sendBroadcastEvent
};
