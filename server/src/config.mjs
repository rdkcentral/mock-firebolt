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

import fs from 'fs';
import { dotConfig } from './dotConfig.mjs';
import { searchJSONforParam, createAbsoluteFilePath, replaceKeyInJSON } from './util.mjs';
import { logger } from './logger.mjs';

// IMPORTANT NOTES:
// - app.defaultUserId here should match app.defaultUserId in the config.mjs file in the
//   cli directory/sub-repo and the value in the .mf-SAMPLE.config.json file also in
//   the cli directory/sub-repo.

// Static configuration (some of which can be overridden by command-line arguments)
const config = {

  validate: [ "method", "params", "response", "events" ],
  multiUserConnections: "warn",
  
  app: {
    allowMixedCase: true,
    socketPort: 9998,
    httpPort: 3333,
    conduitSocketPort: 9997,
    conduitKeySocketPort: 9996,         // Key forwarding from Conduit
    developerToolPort: 9995,            // Port for Firebolt to connect to
    developerToolName: 'Mock Firebolt', // Used when publishing with DNS-SD
    defaultUserId: '12345',
    magicDateTime: {
      prefix: '{{',
      suffix: '}}'
    },
    developerNotesTagName: 'developerNotes'
  }
};

// Layer in configuration specified via .mf.config.json file
config.dotConfig = dotConfig;

/* 
* @function:compareConfigs
* @Description: To compare changed and original config files and perform dynamic config updates
* @param {Object} changedConfig - config that contains updates/additions wrt original config objects
* @param {Object} loadedConfig - original config
*/
function compareConfigs(changedConfig, loadedConfig) {
  // Iterate through new config array in changedConfig
  for (const newObj of changedConfig.new) {
    const newNameToCheck = newObj.name;
    const readme = newObj.readme;
    if (newNameToCheck && !searchJSONforParam(loadedConfig, newNameToCheck)) {
      if (readme) {
        logger.warn(`WARNING: There is an unused config ${newObj.name}. Refer ${readme} for more info `);
      } else {
        logger.warn(`WARNING: There is an unused config ${newObj.name}`);
      }
    }
  }
  // Iterate through changed config array in changedConfig
  for (const changedObj of changedConfig.changed) {
    const oldNameToCheck = changedObj.oldName;
    const readme = changedObj.readme;
    if (oldNameToCheck && searchJSONforParam(loadedConfig, oldNameToCheck)) {
      if (readme) {
        logger.warn(`WARNING: The config ${changedObj.oldName} has been renamed to ${changedObj.newName}. Refer ${readme} for more info `);
      } else {
        logger.warn(`WARNING: The config ${changedObj.oldName} has been renamed to ${changedObj.newName}`);
      }
    }
    // For performing dynamic config updates and offering backward compatibility
     replaceKeyInJSON(config, changedObj.oldName, changedObj.newName);
  }
}

const changedConfig = JSON.parse(fs.readFileSync(createAbsoluteFilePath('changedConfigs.json'), 'utf8'));
compareConfigs(changedConfig, config)

// --- Exports ---

export {
  config
};
