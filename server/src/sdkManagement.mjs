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

import { config } from './config.mjs';
import * as commandLine from './commandLine.mjs';

function isSdkEnabled(sdkName) {
  // Check if sdk with given name is enabled in the .mf.config.json file
  const oSdk = config.dotConfig.supportedOpenRPCs.find((oSdk) => { return ( oSdk.name === sdkName ); });
  if ( oSdk && oSdk.enabled ) {
    return true;
  }

  // Check if sdk with given name is enabled via a command-line flag
  if ( commandLine.enabledSdkNames.includes(sdkName) ) {
    return true;
  }

  // Must not be enabled
  return false;
}

// --- Exports ---

export {
  isSdkEnabled
};
