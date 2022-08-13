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
import { logger } from './logger.mjs';
import { config } from './config.mjs';
import { mergeArrayOfStrings } from './util.mjs';

// Usage:
//   node index.mjs                                          (core SDK only, default)
//   node index.mjs --httpPort 3334 ...                      (Use custom port for RESTful control API (default: 3333))
//   node index.mjs --socketPort 9876 ...                    (Use custom socket port for Firebolt OpenRPC msgs (default: 9998))
//   node index.mjs --manage ...                             (core + manage SDKs)
//   node index.mjs --manage --discovery ...                 (core + manage + discovery SDKs)
//   node index.mjs --triggers <path1> --triggers <path2>    (Load triggers from files in these paths)
//   node index.mjs --novalidate <opt1> --novalidate <opt2>  (does not validate options provided by user)

const knownOpts = {
  'httpPort'   : Number,
  'socketPort' : Number,
  'triggers'   : [String, Array],
  'novalidate' : [String, Array],
  'proxy'      : String
};
for ( const [sdk, oSdk] of Object.entries(config.dotConfig.supportedSdks) ) {
  if ( oSdk.cliFlag ) {
    if ( ! knownOpts.hasOwnProperty(oSdk.cliFlag) ) {
      knownOpts[oSdk.cliFlag] = Boolean;
    } else {
      logger.error(`ERROR: ${oSdk.cliFlag} is already used as a command-line flag`);
      process.exit(1);
    }
  }
}

const shortHands = {
  't'     : [ '--triggers' ],
  'noval' : [ '--novalidate' ]
};
for ( const [sdk, oSdk] of Object.entries(config.dotConfig.supportedSdks) ) {
  if ( oSdk.cliShortFlag ) {
    if ( ! shortHands.hasOwnProperty(oSdk.cliShortFlag) ) {
      shortHands[oSdk.cliShortFlag] = [ `--${oSdk.cliFlag}` ];
    } else {
      logger.error(`ERROR: ${oSdk.cliShortFlag} is already used as a command-line shorthand flag`);
      process.exit(1);
    }
  }
}

const parsed = nopt(knownOpts, shortHands, process.argv, 2);

// --- Ports

const httpPort = parsed.httpPort || config.app.httpPort;
const socketPort = parsed.socketPort || config.app.socketPort;
const proxy = parsed.proxy;

// --- novalidate overrides
config.validate = mergeArrayOfStrings(config.validate, config.dotConfig.validate, parsed.novalidate)

// --- Enabled SDKs specified via any SDK command-line flags OR via .mf.config.json file

// Convert boolean flags for any SDKs into a simple map/dict/obj
const sdks = {};
for ( const [sdk, oSdk] of Object.entries(config.dotConfig.supportedSdks) ) {
  if ( parsed[oSdk.name] || oSdk.enabled ) {
    sdks[oSdk.name] = true;
  }
}

// Create array of enabled SDK names
const sdkNames = Object.keys(sdks);
const enabledSdkNames = sdkNames.filter(function(sdkName) {
  return sdks[sdkName];
});

logger.info(`Enabled Firebolt SDKs: ${enabledSdkNames.join(', ')}`);

// --- Trigger paths specified via --triggers/-t

const enabledTriggerPaths = parsed.triggers || [];

if ( enabledTriggerPaths.length > 0 ) {
  logger.info(`Triggers will be read from these paths: ${enabledTriggerPaths.join(', ')}`);
}

// --- Exports ---

export {
  httpPort, socketPort, enabledSdkNames, enabledTriggerPaths, proxy
};
