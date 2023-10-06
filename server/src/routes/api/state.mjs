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
import { getUserIdFromReq } from '../../util.mjs';
import * as fireboltOpenRpc from '../../fireboltOpenRpc.mjs';
import * as commonErrors from '../../commonErrors.mjs';
import * as stateManagement from '../../stateManagement.mjs';
import * as sessionManagement from '../../sessionManagement.mjs';
import * as events from '../../events.mjs';
import { config } from '../../config.mjs';


// --- Route Handlers ---

// GET /api/v1/state
// params: userId,merged
function getState(req, res) {
  const userId = getUserIdFromReq(req);
  const merged = req.get('merged')== "false" ?false :true;
  const state = stateManagement.getState(userId,merged);
  res.status(200).send({
    status: 'SUCCESS',
    state: state
  });
}

// POST /api/v1/state/global/latency
// Expected body: { latency: { min: xxx, max: xxx } }
function setLatency(req, res) {
  const userId = getUserIdFromReq(req);
  if ( 'latency' in req.body ) {
    const latency = req.body.latency;

    // Validate the latency object

    // - If latency object contains a min or a max at the top-level, it should also include the other
    if ( ( 'min' in latency && ! 'max' in latency ) || ( ! 'min' in latency && 'max' in latency ) ) {
      res.status(400).send({
        status: 'ERROR',
        errorCode: 'MISSING-MIN-OR-MAX',
        message: "Did not find expected 'min' and/or 'max' key within 'latency' value within post body"
      }); 
      return;
    }

    // - For any method-specific specifications, each object (per method) has a min and max
    for ( const [methodName, oMinMax] of Object.entries(latency) ) {
      if ( ! 'min' in oMinMax || ! 'max' in oMinMax ) {
        res.status(400).send({
          status: 'ERROR',
          errorCode: 'MISSING-MIN-OR-MAX-FOR-METHOD',
          message: `Did not find expected 'min' and/or 'max' key within 'latency' value for method ${methodName} within post body`
        });
        return;
      }
    }

    // We have a valid latency object, so use it to, uh, set latencies (globally, per-method(s), or both)

    try {
      stateManagement.setLatencies(userId, latency);

      res.status(200).send({
        status: 'SUCCESS'
      });
    } catch ( ex ) {
      if ( ex instanceof commonErrors.DataValidationError ) {
        res.status(400).send({
          status: 'ERROR',
          errorCode: 'INVALID-STATE-DATA-FOR-LATENCY-1',
          message: 'Invalid state data provided',
          error: ex
        });
      } else {
        res.status(400).send({
          status: 'ERROR',
          errorCode: 'INVALID-STATE-DATA-FOR-LATENCY-2',
          message: 'Invalid state data provided',
          error: ex
        });
      }
    }

  } else {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'MISSING-LATENCY',
      message: "Did not find expected 'latency' key within post body"
    }); 
  }
}

// POST /api/v1/state/global/mode
// Expected body: { mode: 'xxx' }, where xxx is a valid mode (see stateManagement.mjs)
function setMode(req, res) {
  const userId = getUserIdFromReq(req);
  if ( 'mode' in req.body ) {
    const mode = req.body.mode;
    if ( stateManagement.isLegalMode(mode) ) {
      stateManagement.setMode(userId, mode);

      res.status(200).send({
        status: 'SUCCESS'
      });
    } else {
      res.status(400).send({
        status: 'ERROR',
        errorCode: 'ILLEGAL-MODE',
        message: `${mode} is not a legal 'mode' value`
      });
    }
  } else {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'MISSING-MODE',
      message: "Did not find expected 'mode' key within post body"
    }); 
  }
}

// POST /api/v1/state/method/:methodName/result
// Expected body: { result: xxx }
function setMethodResult(req, res) {
  const userId = getUserIdFromReq(req);
  let methodName = req.params.methodName;
  if (config.app.allowMixedCase){
    methodName = methodName.toLowerCase();
  }
  if ( 'result' in req.body ) {
    const result = req.body.result;
    try {
      stateManagement.setMethodResult(userId, methodName, result);

      res.status(200).send({
        status: 'SUCCESS'
      });
    } catch ( ex ) {
      if ( ex instanceof commonErrors.DataValidationError ) {
        res.status(400).send({
          status: 'ERROR',
          errorCode: 'INVALID-STATE-DATA-FOR-METHOD-RESULT-1',
          message: 'Invalid state data provided',
          error: ex
        });
      } else {
        es.status(400).send({
          status: 'ERROR',
          errorCode: 'INVALID-STATE-DATA-FOR-METHOD-RESULT-2',
          message: 'Invalid state data provided',
          error: ex
        });
      }
    }
  } else {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'MISSING-RESULT',
      message: "Did not find expected 'result' key within post body"
    });  
  }
}

// POST /api/v1/state/method/:methodName/error
// Expected body: { error: { code: xxx, message: xxx } }
function setMethodError(req, res) {
  const userId = getUserIdFromReq(req);
  let methodName = req.params.methodName;
  if (config.app.allowMixedCase){
    methodName = methodName.toLowerCase();
  }
  if ( 'error' in req.body ) {
    const err = req.body.error;
    const { code, message } = err;
    if ( code && message ) {
      try {
        stateManagement.setMethodError(userId, methodName, code, message);

        res.status(200).send({
          status: 'SUCCESS'
        });
      } catch ( ex ) {
        if ( ex instanceof commonErrors.DataValidationError ) {
          res.status(400).send({
            status: 'ERROR',
            errorCode: 'INVALID-STATE-DATA-FOR-METHOD-ERROR-1',
            message: 'Invalid state data provided',
            error: ex
          });
        } else {
          res.status(400).send({
            status: 'ERROR',
            errorCode: 'INVALID-STATE-DATA-FOR-METHOD-ERROR-2',
            message: 'Invalid state data provided',
            error: ex
          });
        }
      }
    } else {
      res.status(400).send({
        status: 'ERROR',
        errorCode: 'MISSING-CODE-OR-MESSAGE',
        message: "Did not find expected 'code' and/or 'message' key within 'error' value within post body"
      }); 
    }
  } else {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'MISSING-ERROR',
      message: "Did not find expected 'error' key within post body"
    }); 
  }
}

// PUT /api/v1/state
// Expected body: { state: <stateObject> }
// Where <stateObject> is an object that matches the structure of the internal state object
// and which can be (and normally is) a subset of the full state object so that only portions of the state can be updated
// E.g., { state: { global: { mode: 'DEFAULT' } }, methods: { 'account.id': { result: '555' } } } would
// set both the global mode and the result for the account.id method
function updateState(req, res) {
  const userId = getUserIdFromReq(req);
  if ( 'state' in req.body ) {
    const state = req.body.state;

    try {
      stateManagement.updateState(userId, state);

      res.status(200).send({
        status: 'SUCCESS'
      });
    } catch ( ex ) {
      if ( ex instanceof commonErrors.DataValidationError ) {
        res.status(400).send({
          status: 'ERROR',
          errorCode: 'INVALID-STATE-DATA',
          message: 'Invalid state data provided',
          error: ex
        });
      } else {
        logger.error('ERROR: Exception in updateState:');
        logger.error(ex);
        res.status(500).send({
          status: 'ERROR',
          errorCode: 'COULD-NOT-VALIDATE-AND-UPDATE-STATE',
          message: 'Could not validate and update state',
          error: ex.toString()
        });
      }
    }
  } else {
    res.status(400).send({
      status: 'ERROR',
      errorCode: 'MISSING-STATE',
      message: "Did not find expected 'state' key within post body"
    }); 
  }
}

// POST /api/v1/state/revert
// Expected body: N/A
function revertState(req, res) {
  const userId = getUserIdFromReq(req);
  if (sessionManagement.isRecording(userId)) {
    sessionManagement.stopRecording(userId);
  }
  stateManagement.revertState(userId);  
  res.status(200).send({
    status: 'SUCCESS'
  });
}

// --- Exports ---

export {
  getState,
  setLatency, setMode,
  setMethodResult, setMethodError,
  updateState, revertState
};
