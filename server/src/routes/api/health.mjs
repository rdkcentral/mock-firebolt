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

// HTTP-based API routes: Health Check-Related

'use strict';

import { readFile } from 'fs/promises';
import { config } from '../../config.mjs';
import * as fireboltOpenRpc from '../../fireboltOpenRpc.mjs';
import * as sdkManagement from '../../sdkManagement.mjs';

// Load the package.json file
const packageJson = JSON.parse(
  await readFile(
    new URL('../../../package.json', import.meta.url)
  )
);

let meta;

// --- Route Handlers ---

// GET /api/v1/healthcheck
function healthcheck(req, res) {
  const response = {
    status: 'OK',
    versionInfo: {
      mockFirebolt: packageJson.version,
      sdk: {}
    }
  };

  if ( ! meta ) {
    meta = fireboltOpenRpc.getMeta();
  }

  config.dotConfig.supportedOpenRPCs.forEach(function(oSdk) {
    const sdkName = oSdk.name;
    if ( sdkManagement.isSdkEnabled(sdkName) ) {
      if ( meta[sdkName] && meta[sdkName].info ) {
        response.versionInfo.sdk[sdkName] = meta[sdkName].info.version;
      } else {
        response.versionInfo.sdk[sdkName] = '**UNAVAILABLE**';
      }
    }
  });

  res.status(200).send(response);
}

// --- Exports ---

export {
  healthcheck
};
