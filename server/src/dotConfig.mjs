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

// Configuration Via .mf.config.json Files

'use strict';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logger } from './logger.mjs';

function loadDotConfig() {
  let __filename, __dirname, fileName, dotConfig;
  try {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
    fileName = path.resolve(__dirname, '.mf.config.json');

    dotConfig = JSON.parse(
      fs.readFileSync(fileName, 'UTF-8')
    );

    logger.info(`Read Mock Firebolt configuration from ${fileName}`);
  } catch ( ex ) {
    logger.error(`ERROR: Could not read Mock Firebolt configuration from ${fileName}`);

    fileName = path.resolve(__dirname, '../src', '.mf.config.SAMPLE.json');
    if ( fs.existsSync(fileName) ) {
      logger.error('You probably want to "cp src/.mf.config.SAMPLE.json src/.mf.config.json && npm run build:mf"');
    }

    process.exit(1);
  }
  return dotConfig;
}

const dotConfig = loadDotConfig();

// --- Exports ---

export {
  dotConfig
};
