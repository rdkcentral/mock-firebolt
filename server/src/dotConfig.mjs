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

function handleError(fileName, __dirname) {
  logger.error(
    `ERROR: Could not read Mock Firebolt configuration from ${fileName}`
  );

  fileName = path.resolve(__dirname, "../src", ".mf.config.SAMPLE.json");
  if (fs.existsSync(fileName)) {
    logger.error(
      'You probably want to "cp src/.mf.config.SAMPLE.json src/.mf.config.json && npm run build:mf"'
    );
  }
}
/* 
* @function:createAbsoluteFilePath
* @Description: Create absolute filepath from given file name
* @param {String} fileName - file name ex: .mf.config.SAMPLE.jsons
* @Return: Absolute file path ex: D:\mock-firebolt\server\src\.mf.config.SAMPLE.json
*/
function createAbsoluteFilePath(fileName) {
  let filePath, __dirname, __filename
  __filename = fileURLToPath(import.meta.url).replace("build", "src");
  __dirname = path.dirname(__filename);
  filePath = path.resolve(__dirname, fileName);
  return filePath
}

function loadDotConfig() {
  let fileName, dotConfig;
  try {
    fileName = createAbsoluteFilePath ('.mf.config.json');

    dotConfig = JSON.parse(
      fs.readFileSync(fileName, 'UTF-8')
    );
    // For offering backward compatibility to support "supportedSDKs" 
    if (dotConfig.hasOwnProperty("supportedSDKs")) {
      dotConfig.supportedOpenRPCs = dotConfig.supportedSDKs
    }
    logger.info(`Read Mock Firebolt configuration from ${fileName}`);
  } catch ( ex ) {
    handleError(fileName, __dirname);

    process.exit(1);
  }
  return dotConfig;
}

/* 
* @function:getCreationDate
* @Description: To get creation date of file in seconds
* @param {String} fileName - Name of file whose creation time needs to be retrieved in seconds
* @Return: creation time in seconds ex: 1687860231
*/

function getCreationDate(fileName) {
  let cFile = createAbsoluteFilePath (fileName)
  const creationTimeSec = Math.floor(fs.statSync(cFile).birthtimeMs / 1000);
  return creationTimeSec
}

/* 
* @function:getModificationDate
* @Description: To get modification date of file in seconds
* @param {String} fileName - Name of file whose modification time needs to be retrieved in seconds
* @Return: modification time in seconds ex: 1687860232
*/
function  getModificationDate(fileName) {
  let mFile = createAbsoluteFilePath (fileName)
  const modificationTimeSec = Math.floor(fs.statSync(mFile).mtimeMs / 1000);
  return modificationTimeSec
}

const creationTimeSec = getCreationDate('.mf.config.SAMPLE.json')
const modificationTimeSec = getModificationDate('.mf.config.json')

if (creationTimeSec >= modificationTimeSec) {
  logger.importantWarning("The .mf.config.SAMPLE.json file in your repo is newer than your .mf.config.json file. Changes to the config file format may have occurred since you created or edited your file, and you may need to merge your changes within the changes to the sample file. Refer to the release notes for more information.")
}

const dotConfig = loadDotConfig();

// --- Exports ---

export const testExports = {
  handleError
};

export {
  dotConfig
};
