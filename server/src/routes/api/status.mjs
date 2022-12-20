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

// HTTP-based API routes: State-Related

'use strict';

import { getWsForUser } from '../../userManagement.mjs';
import { getUserIdFromReq } from '../../util.mjs';
import WebSocket from 'ws'

const states = {
  "0": "CONNECTING",
  "1": "CONNECTED",
  "2": "CLOSING",
  "3": "CLOSED",
}

function getStatus(req,res){
    const userId = getUserIdFromReq(req);
    let userWs = getWsForUser(userId);

    if (userWs) {
      res.status(200).send({
        status: "WS connection found",
        readyState: states[userWs.readyState]
      })
    } else {
      res.status(404).send({
        status: "No WS connection found for user " + userId
      })
    }
}

export { getStatus }