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

// Pre- and post-message trigger logic to be invoked during OpenRPC message handler function / logic

import * as fs from 'fs';
import * as path from 'path';
import * as commandLine from './commandLine.mjs';

// Ultimately, this is the "map" we're building up
const triggers = {};

// Process a single file found in enabledTriggerPathN/pre.js and/or enabledTriggerPathN/post.js files
// Read the file, create a function out of its source code, and set triggers[methodName][pre|post]
function processFile(methodName, filePath, fileName, fileExt) {
  if ( ! ['pre', 'post'].includes(fileName) ) {
    console.log(`Skipping trigger file ${filePath}; not a pre.js or post.js file`);
    return;
  }

  fs.readFile(filePath, 'utf8', function(error, sTriggerFunctionDefinition) {
    if ( error ) { throw error; }

    let fcn;
    try {
      // Next line assumes sTriggerFunctionDefinition defines a method named <fileName> (e.g., pre or post)
      const sFcnBody = `${sTriggerFunctionDefinition}; return ${fileName}(ctx, params);`;
      const fcn = new Function('ctx', 'params', sFcnBody);

      if ( ! (methodName in triggers) ) {
        triggers[methodName] = {};
      }
      triggers[methodName][fileName] = fcn;
      console.log(`Enabled trigger defined in trigger file ${filePath}`);
    } catch ( ex ) {
      console.log(`Skipping trigger file ${filePath}; an error occurred parsing the JavaScript`);
      console.log(ex);
    }
  });
}

// dir is expected to be a directory whose name is a valid Firebolt method (e.g., lifecycle.ready)
// E.g., dir/post.js
// methodName will be something like 'lifecycle.ready'
function processMethodDir(dir, methodName, processFile) {
  fs.readdir(dir, (error, fileNames) => {
    if ( error ) { throw error; }

    fileNames.forEach(filename => {
      const fileName = path.parse(filename).name;
      const fileExt = path.parse(filename).ext;
      const filePath = path.resolve(dir, filename);

      fs.stat(filePath, function(error, stat) {
        if ( error ) { throw error; }
        const isFile = stat.isFile();
        if (isFile) {
          processFile(methodName, filePath, fileName, fileExt);
        }
      });
    });
  });
}

// dir is expected to be a directory that contains subdirectories for any/all methods for which triggers are defined
// E.g., dir/lifecycle.ready/post.js
function processTopDir(dir, processMethodDir) {
  fs.readdir(dir, (error, fileNames) => {
    if ( error ) { throw error; }

    fileNames.forEach(filename => {
      const fileName = path.parse(filename).name;
      const fileExt = path.parse(filename).ext;
      const filePath = path.resolve(dir, filename);
      fs.stat(filePath, function(error, stat) {
        if ( error ) { throw error; }
        const isFile = stat.isFile();
        if ( ! isFile ) {
          processMethodDir(filePath, filename, processFile);
        }
      });
    });
  });
}

// Load any/all trigger files from requested triggers paths (via --triggers command-line argument(s))
const enabledTriggerPaths = commandLine.enabledTriggerPaths;
enabledTriggerPaths.forEach((dir) => {
  try {
    processTopDir(dir, processMethodDir);
  } catch ( ex ) {
    console.log(`An error occurred trying to processTopDir on ${dir}`);
    console.log(ex);
  }
});

// --- Exports ---

export {
  triggers
};
