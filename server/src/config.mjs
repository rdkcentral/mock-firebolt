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

// App Configuration

'use strict';

// IMPORTANT NOTES:
// - app.defaultUserId here should match app.defaultUserId in the config.mjs file in the
//   cli directory/sub-repo and the value in the .mf-SAMPLE.config.json file also in
//   the cli directory/sub-repo.

const config = {
  app: {
    socketPort: 9998,
    httpPort: 3333,
    defaultUserId: '12345',
    magicDateTime: {
      prefix: '{{',
      suffix: '}}'
    },
    supportedSdks: {
      core:        'firebolt-open-rpc.json',
      moneybadger: 'money-badger-open-rpc.json',
      manage:      'firebolt-manage-open-rpc.json',
      discovery:   'firebolt-discovery-open-rpc.json'
    }
  }
};

// --- Exports ---

export {
  config
};
