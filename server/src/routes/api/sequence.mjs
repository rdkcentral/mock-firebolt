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

import { logger } from '../../logger.mjs';
import {executeSequence} from '../../sequenceManagement.mjs';
import * as commonErrors from '../../commonErrors.mjs';
import { getUserIdFromReq } from '../../util.mjs';

//Execute sequence events with respective delay values
function sendSequence(req, res) {
    try {
        let seqevent
        const { ws } = res.locals; // Like magic!
        const userId = getUserIdFromReq(req);

        if (req.body.seqevent){
            seqevent = req.body.seqevent
        }
        else{
            seqevent = req.body
        }
        executeSequence(ws,userId,seqevent);
        res.status(200).send({
          status: 'SUCCESS'
        });
    } catch ( ex ) {
        if ( ex instanceof commonErrors.DataValidationError ) {
            res.status(400).send({
            status: 'ERROR',
            errorCode: 'INVALID-SEQUENCE-DATA',
            message: 'Invalid sequence data provided',
            error: ex
            });
        } else {
            logger.error('ERROR: Exception in sendEvent:');
            logger.error(ex);
            res.status(500).send({
            status: 'ERROR',
            errorCode: 'COULD-NOT-VALIDATE-AND-UPDATE-STATE',
            message: 'Could not validate and update state',
            error: ex.toString()
            });
        }
    }
}

// --- Exports ---
export { sendSequence };
