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
  // Merge SDKs if bidirectional is enabled
  const allSdks = [
    ...config.dotConfig.supportedOpenRPCs,
    ...(config.dotConfig.bidirectional ? config.dotConfig.supportedToAppOpenRPCs || [] : []),
  ];

  // Check if SDK is enabled in config or via command-line flags
  return allSdks.some(({ name, enabled }) => name === sdkName && enabled) || 
         commandLine.enabledSdkNames.includes(sdkName);
}

// --- Exports ---

export {
  isSdkEnabled
};
