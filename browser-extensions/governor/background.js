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

var g_portNumber;

// ====================================================================================================
var baseUrl = 'http://localhost';
// ====================================================================================================

function getPortNumber()   { return g_portNumber; }
function setPortNumber(pn) { g_portNumber = pn; }


async function _postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',                         // no-cors, *cors, same-origin
    cache: 'no-cache',                    // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin',           // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'  // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',                   // manual, *follow, error
    referrerPolicy: 'no-referrer',        // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data)             // body data type must match "Content-Type" header
  });
  return response.json();
}


function _sendFireboltLifecycleEvent(method, result, cb) {
  const mockFireboltRestUrl = `${baseUrl}:${g_portNumber}/api/v1/event`;
  const body = { method, result };

  _postData(mockFireboltRestUrl, body)
    .then(function(data) {
      console.log(`_sendFireboltLifecycleEvent("${method}", "${result}") returned data:`);
      console.log(data); // JSON data parsed by `data.json()` call
      cb(null, data);
    })
    .catch(function(ex) {
      console.log(`_sendFireboltLifecycleEvent("${method}", "${result}") threw an error:`);
      console.log(ex);
      cb(ex);
    });
}


async function sendFireboltLifecycleEvent_Inactive(cb) {
  return await _sendFireboltLifecycleEvent('lifecycle.onInactive', { state: 'inactive' }, cb);
}

async function sendFireboltLifecycleEvent_Background(cb) {
  return await _sendFireboltLifecycleEvent('lifecycle.onBackground', { state: 'background' }, cb);
}

async function sendFireboltLifecycleEvent_Foreground(cb) {
  return await _sendFireboltLifecycleEvent('lifecycle.onForeground', { state: 'foreground' }, cb);
}
