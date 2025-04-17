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

// InteractionLogs

import { logger } from './logger.mjs';

/**
 * @function: createAndSendInteractionLog
 * @Description: Create interaction log and send it to the client
 * @param {String} response - Response of the method call
 * @param {String} method - Name of the method
 * @param {String} params - Params of the method call
 * @param {Object} ws - WS object to send the interaction log
 * @param {String} ws - UserId value
 */
function createAndSendInteractionLog(response, method, params, ws, userId) {
  try {
    const interactionLog = {
      app_id: "mock-firebolt",
      method: "",
      params: "",
      success: true,
      response: "",
    };

    interactionLog.params = params;
    interactionLog.method = method;
    interactionLog.response = response;
    if (ws) {
      ws.send(JSON.stringify({ FireboltInteraction: interactionLog }));
      logger.debug(
        `Sent interaction log for user ${userId}: ${JSON.stringify({
          FireboltInteraction: interactionLog,
        })}`
      );
    } else {
      logger.error(
        `Error in createAndSendInteractionLog: ws object is not provided`
      );
    }
  } catch (error) {
    logger.error(`Error in createAndSendInteractionLog: ${error}`);
  }
}

// ----exports----

export { createAndSendInteractionLog };
