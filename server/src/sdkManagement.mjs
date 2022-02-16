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

// SDK management

'use strict';

import nopt from 'nopt';

// Usage:
//   node index.mjs                              (core SDK only, default)
//   node index.mjs --manage                     (core + manage SDKs)
//   node index.mjs --manage --discovery         (core + manage + discovery SDKs)
const knownOpts = {
  'manage'   : Boolean,
  'discovery': Boolean
};

const shortHands = {
  'm' : [ '--manage' ],
  'd' : [ '--discovery' ]
};

const parsed = nopt(knownOpts, shortHands, process.argv, 2);

const sdks = {
  core      : true,
  manage    : parsed.manage,
  discovery : parsed.discovery
};

const sdkNames = Object.keys(sdks);
const enabledSdkNames = sdkNames.filter(function(sdkName) {
  return sdks[sdkName]
});
console.log(`Enabled Firebolt SDKs: ${enabledSdkNames.join(', ')}`);

function isSdkEnabled(sdkName) {
  if ( sdkName in sdks ) {
    return sdks[sdkName];
  }
  return false;
}

// --- Exports ---

export {
  isSdkEnabled
};
