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

'use strict';

import ip from 'ip';
import bonjour from 'bonjour';
import { logger } from './logger.mjs';
import * as commandLine from './commandLine.mjs';

// advertise a Firebolt developer tool (type=ws, subtype=firebolt)
const developerToolPort = commandLine.developerToolPort;
let developerToolName = commandLine.developerToolName;
// @TODO: Look for conflicts and bump name (e.g., "Mock Firebolt 2", etc.)
const options = {
    name     : developerToolName,
    host     : ip.address(),           // Get IP# of current host (developer laptop)
    port     : developerToolPort,      // This will be a new port we open up @TODO
    type     : 'ws',                   // We may change this later
    subtypes : [ 'firebolt' ],
    protocol : 'tcp',
    txt      : {}
};
  
bonjour().publish(options);
logger.info(`Published as a Firebolt developer tool ${developerToolName} on port ${developerToolPort}`);
