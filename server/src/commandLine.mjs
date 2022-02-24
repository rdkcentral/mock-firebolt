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

// Command-Line Parsing and State

'use strict';

import nopt from 'nopt';
import { config } from './config.mjs';

// Usage:
//   node index.mjs                                          (core SDK only, default)
//   node index.mjs --httpPort 3334 ...                      (Use custom port for RESTful control API (default: 3333))
//   node index.mjs --socketPort 9876 ...                    (Use custom socket port for Firebolt OpenRPC msgs (default: 9998))
//   node index.mjs --manage ...                             (core + manage SDKs)
//   node index.mjs --manage --discovery ...                 (core + manage + discovery SDKs)
//   node index.mjs --triggers <path1> --triggers <path2>    (Load triggers from files in these paths)
const knownOpts = {
  'httpPort'   : Number,
  'socketPort' : Number,
  'manage'     : Boolean,
  'discovery'  : Boolean,
  'triggers'   : [String, Array]
};

const shortHands = {
  'm' : [ '--manage' ],
  'd' : [ '--discovery' ],
  't' : [ '--triggers' ]
};

const parsed = nopt(knownOpts, shortHands, process.argv, 2);

// --- Ports

const httpPort = parsed.httpPort || config.app.httpPort;
const socketPort = parsed.socketPort || config.app.socketPort;

// --- Enabled SDKs specified via --manage/-m, --discovery/-d, and implied core SDK

// Convert boolean flags for manage and discovery + implied true for core into a simple map/dist/obj
const sdks = {
  core      : true,
  manage    : parsed.manage,
  discovery : parsed.discovery
};

// Create array of enabled SDK names
const sdkNames = Object.keys(sdks);
const enabledSdkNames = sdkNames.filter(function(sdkName) {
  return sdks[sdkName];
});

console.log(`Enabled Firebolt SDKs: ${enabledSdkNames.join(', ')}`);

// --- Trigger paths specified via --triggers/-t

const enabledTriggerPaths = parsed.triggers || [];

if ( enabledTriggerPaths.length > 0 ) {
  console.log(`Triggers will be read from these paths: ${enabledTriggerPaths.join(', ')}`);
}

// --- Exports ---

export {
  httpPort, socketPort, enabledSdkNames, enabledTriggerPaths
};
