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

// In-memory "database" of overall mock server state and per-method override state

'use strict';

import { mergeWith } from 'lodash-es';  // Deep merge needed; Object.assign is shallow, sadly
import { config } from './config.mjs';
import { logger } from './logger.mjs';
import * as magicDateTime from './magicDateTime.mjs';
import * as fireboltOpenRpc from './fireboltOpenRpc.mjs';
import * as commonErrors from './commonErrors.mjs';
import * as util from './util.mjs';
import { sendBroadcastEvent, sendEvent, logSuccess, logErr, logFatalErr } from './events.mjs';
import { v4 as uuidv4 } from 'uuid';

const Mode = {
  BOX: 'BOX',            // Log settrs, return default defaults for each gettr based on first example within OpenRPC specification
  DEFAULT: 'DEFAULT'     // Log settrs, return current mock value for each gettr (as controlled by CLI, browser extension, admin UI)
};

let perUserStartState = {
  // Global state, which affects the mock Firebolt server as a whole
  global: {
    mode: Mode.DEFAULT,
    latency: {
      min: 0, max:0,
      // Per-method latencies given as keys which are fq method names & values as objects with min, max values
    }
  },

  // A place where result, response, preResult, postResult, preResponse, postResponse functions can share state
  // NOTE: There is no namespacing by method, so care should be taken
  scratch: {
  },

  // Per-method state, which affects what each Firebolt method does / returns
  // Each key is a fully qualified method name (e.g., 'account.id')
  // Each value is either { result: xxx } or { error: { code: xxx, message: xxx } }
  methods: {
    // 'moduleX.methodM1': { result: <responseValue> }
    // 'moduleX.methodM2': { error: { code: -32601, message: 'xxx' } }
  },

  // Per-method state related to sequence-of-responses specifications
  // Each key is a fully qualified method name
  // Each value is an object which holds the NEXT INDEX into the responses array to use for the method
  // Note the absence of a key impliese "use index 0"
  sequenceState: {
    // 'moduleX.methodM1': { index: 0 }
  }
};

// Keys are userIds, values are state objects like the one above
let state = {};

// Add default user, which will be used anytime a userId is not specified
// in REST calls (calls without an x-mockfirebolt-userid header), regardless of whether
// these are calls to the API via cURL or Postman, or whether these are coming from
// the CLI, the web admin UI, or a browser extension.
addDefaultUser(config.app.defaultUserId);

//Adding global user while initialising mfos
addUser('global');

function addUser(userId) {
  state[''+userId] = JSON.parse(JSON.stringify(perUserStartState));  // Deep copy
}

function addDefaultUser(userId) {
  addUser(userId);
  state[''+userId].isDefaultUserState = true;
}

// return state based on hierarchy (From lowest priority to highest) global->group->user
function getState(userId) {

  if ( userId in state ) {
    const stateCopy = JSON.parse( JSON.stringify(state) )
    let finalState = stateCopy['global'];
    userId = '' + userId;
    if( userId.includes("~")){
      let group = "~"+userId.split("~")[1];
      if (group in stateCopy){
        let groupState = stateCopy[''+group];
        resetSequenceStateValues(finalState, groupState);
        mergeWith(finalState, groupState, mergeCustomizer);
      }
    }
    if (userId in stateCopy){
      const userState = stateCopy[''+userId];
      resetSequenceStateValues(finalState, userState);
      mergeWith(finalState, userState, mergeCustomizer);
    }

    resetSequenceStateValues(state[''+userId], finalState);
    mergeWith(state[''+userId], finalState, mergeCustomizer);
    return state[''+userId];
  }

  logger.info(`Could not find state for user ${userId}; using default user ${config.app.defaultUserId}`);
  return state[config.app.defaultUserId];
}

async function getAppropriateDelay(userId, methodName) {
  const userState = getState(userId);

  if ( ! userState.global ) { return; }
  if ( ! userState.global.latency ) { return; }

  const globalMin = userState.global.latency.min || 0;
  const globalMax = userState.global.latency.max || 0;

  let perMethodMin = null;
  let perMethodMax = null;
  if ( methodName in userState.global.latency ) {
    perMethodMin = userState.global.latency[methodName].min;
    perMethodMax = userState.global.latency[methodName].max;
  }

  const min = ( perMethodMin !== null ? perMethodMin : globalMin ); // Careful of 0 values!
  const max = ( perMethodMax !== null ? perMethodMax : globalMax ); // Careful of 0 values!

  const dly = ( min === max ? min : util.randomIntFromInterval(min, max) );

  return dly;
}

function hasOverride(userId, methodName) {
  const userState = getState(userId);
  if ( ! userState ) { return false; }
  const resp = userState.methods[methodName];
  if ( ! resp ) { return false; }
  if ( resp.response ) { return true; }
  if ( resp.result ) { return true; }
  if ( resp.error ) { return true; }
  if ( resp.responses ) { return true; }
  return false;
}

// Handle sequence-of-responses values, which are arrays of either result, error, or response objects
function handleSequenceOfResponseValues(userId, methodName, params, resp, userState) {
  const nextIndex = userState.sequenceState[methodName] || 0;
  if ( nextIndex < resp.responses.length ) {
    resp = resp.responses[nextIndex];
  } else if ( resp.policy && resp.policy.toUpperCase() === 'REPEAT-LAST-RESPONSE') {
    resp = resp.responses[resp.responses.length - 1];
  } else {
    resp = undefined; // Will cause code below to use the static default from the OpenRPC specification
  }
  state[''+userId].sequenceState[methodName] = nextIndex + 1;
  return resp;
}

// Log Error for invalid methodName
function logInvalidMethodError(methodName, resultErrors, resp) {
  logger.error(
    `ERROR: The function specified for the result of ${methodName} returned an invalid value`
  );
  logger.error(JSON.stringify(resultErrors, null, 4));
  resp = {
    error: {
      code: -32400, // @TODO: Ensure we're returning the right value and message
      message: "Invalid parameters", // @TODO: Ensure we're returning the right value and message
      data: {
        errors: resultErrors, // @TODO: Ensure we're formally defining this schema / data value
      },
    },
  };
}

// Handle response values, which are always functions which either return a result or throw a FireboltError w/ code & message
function handleDynamicResponseValues(userId, methodName, params, ws, resp){
  if ( typeof resp.response === 'string' && resp.response.trimStart().startsWith('function') ) {
    // Looks like resp.response is specified as a function; evaluate it
    try {
      const ctx = {
        logger: logger,
        setTimeout: setTimeout,
        setInterval: setInterval,
        set: function ss(key, val, scope) { return setScratch(userId, key, val, scope) },
        get: function gs(key) { return getScratch(userId, key); },
        delete: function ds(key, scope) { return deleteScratch(userId, key, scope)},
        uuid: function cuuid() {return createUuid()},
        sendEvent: function(onMethod, result, msg) {
          sendEvent(
            ws,
            userId,
            onMethod,
            result,
            msg,
            logSuccess.bind(this, onMethod, result, msg),
            logErr.bind(this, onMethod),
            logFatalErr.bind(this)
          );
        },
        sendBroadcastEvent: function(onMethod, result, msg) {
          sendBroadcastEvent(
            ws,
            userId,
            onMethod,
            result,
            msg,
            logSuccess.bind(this, onMethod, result, msg),
            logErr.bind(this, onMethod),
            logFatalErr.bind(this)
          );
        },
        FireboltError: commonErrors.FireboltError
      };
      const sFcnBody = resp.response + ';' + 'return f(ctx, params);'
      const fcn = new Function('ctx', 'params', sFcnBody);
      const result = fcn(ctx, params);
      const resultErrors = fireboltOpenRpc.validateMethodResult(result, methodName);
      if ( ! resultErrors || resultErrors.length === 0 ) {
        resp = {
          result: result
        };
      } else {
        // After the result function was called, we're realizing what it returned isn't valid!
        logInvalidMethodError(methodName, resultErrors, resp);
      }
    } catch ( ex ) {
      if ( ex instanceof commonErrors.FireboltError ) {
        // Looks like the function threw a FireboltError, which means we want to mock an error, not a result
        resp = {
          error: { code: ex.code, message: ex.message }
        }
      } else {
        logger.error(`ERROR: Could not execute the function specified for the result of method ${methodName}`);
        logger.error(ex);
        resp = {
          result: undefined  // Something...
        };
      }
    }
  } else {
    logger.error('ERROR: Use a function definition when specifying a result or error via the "response" property');
    resp = {
      result: undefined  // Something...
    };
  }
  return resp;
}

// Handle result values, which are either specified as static values or
// as functions which return values
function handleStaticAndDynamicResult(userId, methodName, params, resp){
  if ( typeof resp.result === 'string' && resp.result.trimStart().startsWith('function') ) {
    // Looks like resp.result is specified as a function; evaluate it
    try {
      const ctx = {
        set: function ss(key, val, scope) { return setScratch(userId, key, val, scope) },
        get: function gs(key) { return getScratch(userId, key); },
        delete: function ds(key, scope) { return deleteScratch(userId, key, scope)},
        uuid: function cuuid() {return createUuid()},
      };
      const sFcnBody = resp.result + ';' + 'return f(ctx, params);'
      const fcn = new Function('ctx', 'params', sFcnBody);
      const result = fcn(ctx, params);
      const resultErrors = fireboltOpenRpc.validateMethodResult(result, methodName);
      if ( ! resultErrors || resultErrors.length === 0 ) {
        resp = {
          result: result
        };
      } else {
        // After the result function was called, we're realizing what it returned isn't valid!
        logInvalidMethodError(methodName, resultErrors, resp);
      }
    } catch ( ex ) {
      logger.error(`ERROR: Could not execute the function specified for the result of method ${methodName}`);
      logger.error(ex);
      resp = {
        result: undefined  // Something...
      };
    }
  } else {
    // Assume resp.result is a "normal" value; leave resp alone
  }
  return resp;
}

// Handle error values, which are either specified as static objects with code & message props or
// as a function which returns such an object
function handleStaticAndDynamicError(userId, methodName, params, resp){
  if ( typeof resp.error === 'string' && resp.error.startsWith('function') ) {
    // @TODO
    resp = {
      result: 'NOT-IMPLEMENTED-YET'  // @TODO
    };
  } else {
    // Assume resp.error is a "normal" error value (object with code and message keys); leave resp alone
  }
  return resp;
}

// Returns either { result: xxx } or { error: { code: xxx, message: 'xxx' } }
// The params parameter isn't used for static mock responses, but is useful when
// specifying result or error by function (see examples/discovery-watched-1.json for an example)
function getMethodResponse(userId, methodName, params, ws) {
  let resp;
  const userState = getState(userId);

  if ( userState.global.mode === Mode.DEFAULT ) {
    // Use mock override values, if present, else use first example value from the OpenRPC specification
    // This includes both "normal" result and error values and also results and errors specified as functions
    // Normally, an object with either a result key, an error key, or a response key
    // But see code directly below that handles sequence-of-responses (responses array values)
    resp = userState.methods[methodName];

    // Handle sequence-of-responses values, which are arrays of either result, error, or response objects
    if ( resp && resp.responses ) {
      resp = handleSequenceOfResponseValues(userId, methodName, params, resp, userState);  
    }

    // Handle response values, which are always functions which either return a result or throw a FireboltError w/ code & message
    if ( resp && resp.response ) {
      resp = handleDynamicResponseValues(userId, methodName, params, ws, resp);
    }

    // Handle result values, which are either specified as static values or
    // as functions which return values
    else if ( resp && resp.result ) {
      resp = handleStaticAndDynamicResult(userId, methodName, params, resp);
    }

    // Handle error values, which are either specified as static objects with code & message props or
    // as a function which returns such an object
    else if ( resp && resp.error ) {
      resp = handleStaticAndDynamicError(userId, methodName, params, resp);
    }
  } else /* if ( userState.global.mode === Mode.BOX ) */ {
    // Only use first example value from the OpenRPC specification; Force 'if' below to be
    // false by setting resp to undefined
    resp = undefined;
  }

  if ( ! resp ) {
    // No mock override info in our userState data structure... return first example
    // value from OpenRPC specification, if available
    let val = fireboltOpenRpc.getFirstExampleValueForMethod(methodName);
    if ( typeof val === 'undefined' ) {
      // No examples for this method in the Open RPC specification
      logger.warning(`WARNING: Method ${methodName} called, but there is no example response for the method in the Firebolt API OpenRPC specification`);
      resp = {
        result: undefined
      };
    } else {
      // Send back the first example from the Open RPC specification for this method
      resp = {
        result: val
      };
    }
  }

  // Evaluate magic date/time strings if we have a (non-undefined) resp object
  if ( resp ) {
    try {
      const prefix = config.app.magicDateTime.prefix;
      const suffix = config.app.magicDateTime.suffix;
      resp = magicDateTime.replaceDynamicDateTimeVariablesObj(resp, prefix, suffix);
    } catch ( ex ) {
      logger.error('ERROR: An error occurred trying to evaluate magic date/time strings');
      logger.error(ex);
    }
  }
  return resp;
}

// Returns array of error strings
function validateNewState_Global(newStateGlobal) {
  // @TODO
  return [];
}

// Returns array of error strings
function validateNewState_Scratch(newStateScratch) {
  // @TODO
  return [];
}

// Returns array of error strings
function validateMethodOverride(methodName, methodOverrideObject) {
  let errors = [];

  if ( 'result' in methodOverrideObject ) {
    errors = errors.concat(fireboltOpenRpc.validateMethodResult(methodOverrideObject.result, methodName));
  } else if ( 'error' in methodOverrideObject ) {
    errors = errors.concat(fireboltOpenRpc.validateMethodError(methodOverrideObject.error));
  } else if ( 'response' in methodOverrideObject ) {
    // Do nothing since validating a response value is impossible because they are always functions
  } else if ( 'responses' in methodOverrideObject ) {
    for ( let rr = 0; rr < methodOverrideObject.responses.length; rr += 1 ) {
      let response = methodOverrideObject.responses[rr];
      if ( 'result' in response ) {
        errors = errors.concat(fireboltOpenRpc.validateMethodResult(response.result, methodName));
      } else if ( 'error' in response ) {
        errors = errors.concat(fireboltOpenRpc.validateMethodError(response.error));
      } else if ( 'response' in response ) {
        // Do nothing since validating a response value is impossible because they are always functions
      } else {
        errors = errors.concat(`ERROR: New state data for ${methodName} has at least one response item that does not contain 'result' or 'error'; One is required`);
      }
    }
  } else {
    errors = errors.concat(`ERROR: New state data for ${methodName} does not contain 'result' or 'error'; One is required`);
  }

  return errors;
}

// Returns array of error strings
function validateNewState_MethodOverrides(newStateMethods) {
  let errors = [];

  // Returns an empty array in "novalidate mode"
  if( !config.validate.includes("response") ){
    return [];
  }
  
  for ( const [methodName, methodOverrideObject] of Object.entries(newStateMethods) ) {
    errors = errors.concat(validateMethodOverride(methodName, methodOverrideObject));
  }
  return errors;
}

// Returns array of errors
function validateNewState(newState) {
  let globalErrors = [];
  let scratchErrors = [];
  let methodOverrideErrors = [];

  if ( 'global' in newState ) {
    globalErrors = validateNewState_Global(newState.global);
  }
  if ( 'scratch' in newState ) {
    scratchErrors = validateNewState_Scratch(newState.scratch);
  }
  if ( 'methods' in newState ) {
    methodOverrideErrors = validateNewState_MethodOverrides(newState.methods);
  }

  const allErrors = [].concat(globalErrors, scratchErrors, methodOverrideErrors);
  return allErrors;
}

// For any methodNames in newState.methods, clear oldState.sequenceState[methodName]
function resetSequenceStateValues(oldState, newState) {
  if ( 'methods' in newState ) {
    for ( let methodName in newState.methods ) {
      if (oldState && oldState.sequenceState && oldState.sequenceState[methodName])
      delete oldState.sequenceState[methodName];
    }
  }
}

// @TODO: Is this right? We really want/need this for "responses" arrays (sequence-of-responses values)
//        but will this code incorrectly do the same for *all* arrays? Is this what we want???
function mergeCustomizer(objValue, srcValue) {
  if ( Array.isArray(objValue) ) {
    return srcValue;
  }
}

function updateState(userId, newState, scope = "") {
  let userState;

  //If no scope is provided, considering userId as scope
  if (scope === ""){
    scope = userId
  }
  if ( scope in state ){
    userState = getState(scope);
  }
  else{
    state[''+scope] = JSON.parse(JSON.stringify(perUserStartState));
    userState = getState(scope);
  }
  if ( userState.isDefaultUserState ) {
    if ( scope === config.app.defaultUserId ) {
      logger.info(`Updating state for default user ${scope}`);
    } else {
      logger.info(`Updating state for default user ${config.app.defaultUserId}, which is being used by default`);
    }
  }
  else {
    if ( scope[0] === "~" ){
      logger.info(`Updating state for group ${scope}`);
    }
    else if ( scope === "global" ){
      logger.info('Updating state globally');
    }
    else{
      logger.info(`Updating state for user ${scope}`);
    }
  }

  const errors = validateNewState(newState);
  if ( errors.length <= 0 ) {
    resetSequenceStateValues(userState, newState);
    mergeWith(userState, newState, mergeCustomizer);
  } else {
    logger.error('Errors found when attempting to update state:');
    errors.forEach(function(errorMessage) {
      logger.error(`${JSON.stringify(errorMessage, null, 4)}`);
    });
    logger.error('State not updated');
    throw new commonErrors.DataValidationError(errors);
  }
}

function revertState(userId) {
  const userState = getState(userId);
  if ( userState.isDefaultUserState ) {
    logger.info(`State for default user ${config.app.defaultUserId} is being reverted`);
  }

  state[''+userId] = JSON.parse(JSON.stringify(perUserStartState));
}

function setLatency(userId, min, max) {
  updateState(userId, {
    global: {
      latency: {
        min: min,
        max: max
      }
    }
  });
}

// Call with oLatency something like:
//   {
//     min: 0, max: 0                               ( global values )
//     device.type: { min: 3000, max: 3000 },       ( per method values )
//     ...
//   }
function setLatencies(userId, oLatency) {
  updateState(userId, {
    global: {
      latency: oLatency
    }
  });
}

function isLegalMode(mode) {
  return ( Object.values(Mode).includes(mode.toUpperCase()) );
}

function setMode(userId, mode) {
  updateState(userId, {
    global: {
      mode: mode.toUpperCase()
    }
  });
}

function setMethodResult(userId, methodName, result) {
  updateState(userId, {
    methods: {
      [methodName]: {
        result: result
      }
    }
  });
}

function setMethodError(userId, methodName, code, message) {
  updateState(userId, {
    methods: {
      [methodName]: {
        error: {
          code: code,
          message: message
        }
      }
    }
  });
}

function setScratch(userId, key, val, scope) {
  updateState(userId, {
    scratch: {
      [key]: val
    }
  }, scope);
}

function getScratch(userId, key) {
  const userState = getState(userId);

  if ( key in userState.scratch ) {
    return userState.scratch[key];
  }
  return undefined;
}

// delete key from scratch space of provided scope
function deleteScratch(userId, key, scope=""){
  if ( scope !== "" ){
    if ( scope in state && key in state[scope].scratch ){
      delete state[scope].scratch[key];
    }
  }
  else{
    if ( userId in state && key in state[userId].scratch ){
      delete state[userId].scratch[key];
    }
  }
}

//To generate uuid
function createUuid(){
  return uuidv4();
}

// --- Exports ---

export const testExports={
  handleStaticAndDynamicError, state, validateMethodOverride, logInvalidMethodError,
  mergeCustomizer,
}
export {
  addUser,
  getState,
  getAppropriateDelay,
  hasOverride, getMethodResponse,
  updateState, revertState,
  setLatency, setLatencies,
  isLegalMode, setMode,
  setMethodResult, setMethodError,
  setScratch, getScratch, deleteScratch, createUuid
};
