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
import * as userManagement from '../../userManagement.mjs'

let id = 1

function getIdAndIncrement() {
    id++;
    return id - 1;
}

function createPayload(method, params) {
    return {
        id: getIdAndIncrement(),
        jsonrpc: "2.0",
        method,
        params
    }
}

function unidirectionalEventToBiDirectional(method) {
    if (method.includes(".")){
        let splitArray = method.split('.');
        let moduleName = splitArray[0];
        let methodName = splitArray[1];

        //Remove "on" if present (FB 1.0 Events)
        if (methodName.startsWith("on")) {
            methodName = methodName.slice(2);
            methodName = String(methodName).charAt(0).toLowerCase() + String(methodName).slice(1);
        }

        method = moduleName.concat(".", methodName);
      }
      return method;
}

// --- Route Handlers ---

// POST /api/v1/bidirectionalPayload
// Expected body: { method: 'device.onDeviceNameChanged' params: {} }
function bidirectionalPayload(req, res) {
    try {
        const userId = getUserIdFromReq(req);
        const ws = userManagement.getWsForUser(userId)
        const { method, params } = req.body;

        let payload = createPayload(unidirectionalEventToBiDirectional(method), params);

        ws.send(JSON.stringify(payload));
        console.log(`Sending bidirectional payload: ${JSON.stringify(payload)}`);

        res.status(200).send({
            status: "Sent payload"
        })
    } catch (error) {
        console.error(error)
        res.status(500).send({
            status: "Cannot send payload",
            error
        })
    }
}

// --- Exports ---

export {
  bidirectionalPayload
};
