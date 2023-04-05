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

// CLI main entry point

//
// For examples, run:
//   node cli.mjs --help
//

'use strict';

const HTTP_HOST = 'localhost';
const HTTP_PORT = 3333;         // Default port where Mock Firebolt receives control requests

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from 'fs';
import yaml from 'js-yaml';
import nopt from 'nopt';
import axios from 'axios';
import { config } from './config.mjs';
import { usage } from './usage.mjs';
import shell from 'shell-exec'
import { logger } from '../../server/src/logger.mjs';
import * as tmp from 'tmp';

// to get root directory of application
function getAppRootDir () {
  let currentDir = __dirname
  while(!fs.existsSync(path.join(currentDir, '.gitignore'))) {
    currentDir = path.join(currentDir, '..')
  }
  let rootDir = currentDir.replace(/\\/g, "/");
  return rootDir
}

function loadConfig() {
  let mfConfig;
  try {
    mfConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '.mf.config.json'), 'UTF-8')
    );
  } catch ( ex ) {
    if ( ex.code !== 'ENOENT' ) {
      console.log(ex);
    }
    console.log('You may want to create a .mf.config.json file for personal use.');
    mfConfig = { userId: config.app.defaultUserId };
  }
  return mfConfig;
}

function url(host, port, path) {
  return `http://${host}:${port}${path}`;
}

// Be sure to update usage.mjs if you make changes here
const knownOpts = {
  'help'            : Boolean,
  'user'            : String,
  'addUser'         : String,
  'port'            : String,
  'quiet'           : Boolean,
  'healthcheck'     : Boolean,
  'state'           : Boolean,
  'merged'          : String,
  'revert'          : Boolean,
  'latency'         : [ Number, Array ],
  'mode'            : [ "default", "box" ],
  'method'          : String,
  'result'          : String,                 // JSON-encoded
  'errCode'         : Number,
  'errMsg'          : String,
  'upload'          : String,
  'event'           : String,
  'broadcastEvent'  : String,
  'sequence'        : String,
  'session'         : String,
  'sessionOutput'   : String,
  'sessionOutputPath' :  String,
  'getStatus'       :  Boolean,
  'downloadOverrides' : String,
  'overrideLocation' : String
};

const shortHands = {
  'h'   : [ '--help' ],
  'au'  : [ '--addUser'],
  'p'   : [ '--port' ],
  'q'   : [ '--quiet' ],
  'hc'  : [ '--healthcheck' ],
  's'   : [ '--state' ],
  'v'   : [ '--revert' ],
  'l'   : [ '--latency' ],
  'mo'  : [ '--mode' ],
  'mg'  : [ '--merged' ],
  'm'   : [ '--method' ],
  'r'   : [ '--result' ],
  'ec'  : [ '--errCode' ],
  'em'  : [ '--errMsg' ],
  'u'   : [ '--upload' ],
  'e'   : [ '--event' ],
  'be'  : [ '--broadcastEvent' ],
  'seq' : [ '--sequence' ],
  'se'  : [ '--session' ],
  'do' :  [ '--downloadOverrides' ],
  'ol'  : [ '--overrideLocation' ]
};

const parsed = nopt(knownOpts, shortHands, process.argv, 2);

const host = HTTP_HOST;
const port = parsed.port || HTTP_PORT;

const dotConfig = loadConfig();
const userId = ''+(parsed.user || parsed.addUser || dotConfig.userId || config.app.defaultUserId);
console.log(`UserId: ${userId}`);
const merged = parsed.merged;
axios.defaults.headers.common['x-mockfirebolt-userid'] = userId;

// If state has merged parameter,It will be passed in the GET request header 
if(merged){
  axios.defaults.headers.common['merged'] = merged;
}

// Show message unless we're in quiet mode
function msg(msg) {
  if ( ! parsed.quiet ) {
    console.log(msg);
  }
}

// Show error response data if possible, else just the error code and message
function logError(error) {
  let msg;
  if ( error.response?.data ) {
    msg = JSON.stringify(error.response.data, null, 4);
  } else {
    msg = `${error.code}: ${error.message}`;
  }
  console.log(msg);
}

// Handle the command (main "switch statement")

if ( parsed.help ) {

  usage();

} else if ( parsed.addUser ) {

  const user = parsed.addUser;

  msg(`Adding user ${user}`);
  axios.put(url(host, port, `/api/v1/user/${ encodeURIComponent(user)}`), undefined)
    .then(function (response) {
      console.log('Response received for addUser', user, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.healthcheck ) {

  msg(`Performing health check...`);
  axios.get(url(host, port, '/api/v1/healthcheck'), undefined)
    .then(function (response) {
      console.log('Response received for performing health check for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

}  else if ( parsed.state ) {

  msg(`Dumping state...`);
  axios.get(url(host, port, '/api/v1/state'), undefined)
    .then(function (response) {
      // Return state directly so the output here can be imported
      // via --upload for export/import purposes
      console.log('Response received for dumping state for user', userId, ':', JSON.stringify(response.data.state, null, 4));
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.revert ) {

  msg(`Reverting state...`);
  axios.post(url(host, port, '/api/v1/state/revert'), undefined)
    .then(function (response) {
      console.log('Response received for reverting state for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.method && parsed.latency ) {

  const method = parsed.method;
  const min = parsed.latency[0];
  const max = ( parsed.latency.length > 1 ? parsed.latency[1] : parsed.latency[0] );
  msg(`Setting per-method latency [min, max] for ${method} to [${min}, ${max}]...`);
  axios.post(url(host, port, '/api/v1/state/global/latency'), {
      latency: {
        [method]: {
          min: min,
          max: max
        }
      }
    })
    .then(function (response) {
      console.log('Response received for setting per-method latency for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.latency ) {

  const min = parsed.latency[0];
  const max = ( parsed.latency.length > 1 ? parsed.latency[1] : parsed.latency[0] );
  msg(`Setting global latency [min, max] to [${min}, ${max}]...`);
  axios.post(url(host, port, '/api/v1/state/global/latency'), {
      latency: {
        min: min,
        max: max
      }
    })
    .then(function (response) {
      console.log('Response received for setting global latency for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.mode ) {

  const mode = parsed.mode;
  msg(`Setting mode to ${mode}...`);
  axios.post(url(host, port, '/api/v1/state/global/mode'), {
      mode: mode
    })
    .then(function (response) {
      console.log('Response received for setting mode for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.method && parsed.result ) {

  const method = parsed.method;
  let result = parsed.result;
  try {
    result = JSON.parse(result);
  } catch (ex) {
    // Quietly fail; assume that result is a 'regular' (non-JSON) string
  }
  msg(`Setting response for ${method} to ${result}...`);
  axios.post(url(host, port, `/api/v1/state/method/${method}/result`), {
      result: result
    })
    .then(function (response) {
      console.log('Response received for setting method response for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.method && parsed.errCode && parsed.errMsg ) {

  const method = parsed.method;
  const errCode = parsed.errCode;
  const errMsg = parsed.errMsg;
  msg(`Setting response for ${method} to an error with code=${errCode} and message=${errMsg}...`);
  axios.post(url(host, port, `/api/v1/state/method/${method}/error`), {
      error: {
        code: errCode,
        message: errMsg
      }
    })
    .then(function (response) {
      console.log('Response received for setting method response to given error code and message for user', userId, ':', response.data);
    })
    .catch(function (error) {
      logError(error);
    });

} else if ( parsed.upload ) {
  if (fs.lstatSync(parsed.upload).isDirectory() ){
    const uploadDir = parsed.upload;
    fs.readdir(uploadDir, (error, fileNames) => {
      if ( error ) { throw error; }
      else if( !fileNames.length ) { console.log('Directory appears to be empty'); }
      else {
        fileNames.forEach(filename => {
          try {
            const sNewState = fs.readFileSync(path.resolve(uploadDir, filename), {encoding:'utf8', flag:'r'});
            let newState;
            if ( filename.endsWith('yaml') || filename.endsWith('yml') ) {
              newState = yaml.load(sNewState);
            } else {
              newState = JSON.parse(sNewState);
            }
            msg(`Uploading file ${filename}...`);
            axios.put(url(host, port, '/api/v1/state'), {
                state: newState
              })
              .then(function (response) {
                console.log('Response received for uploading file' ,filename, 'from directory', uploadDir, 'for user', userId, ':', response.data);
              })
              .catch(function (error) {
                logError(error);
              });
          } catch ( ex ) {
            console.log(`ERROR: File ${filename} is either missing or contains invalid JSON or YAML`);
            console.log(ex);
          }
        });
      }
    });
  } else {
    const uploadFile = parsed.upload;
    try {
      const sNewState = fs.readFileSync(path.resolve(__dirname, uploadFile), {encoding:'utf8', flag:'r'});
      let newState;
      if ( uploadFile.endsWith('yaml') || uploadFile.endsWith('yml') ) {
        newState = yaml.load(sNewState);
      } else {
        newState = JSON.parse(sNewState);
      }
      msg(`Uploading file ${uploadFile}...`);
      axios.put(url(host, port, '/api/v1/state'), {
          state: newState
        })
        .then(function (response) {
          console.log('Response received for uploading file for user', userId, ':', response.data);
        })
        .catch(function (error) {
          logError(error);
        });
    } catch ( ex ) {
      console.log(`ERROR: File ${uploadFile} is either missing or contains invalid JSON or YAML`);
      console.log(ex);
    }
  }

} else if ( parsed.event ) {
  const eventFile = parsed.event;
  try {
    const sEvent = fs.readFileSync(path.resolve(__dirname, eventFile), {encoding:'utf8', flag:'r'});
    let event;
    if ( eventFile.endsWith('yaml') || eventFile.endsWith('yml') ) {
      event = yaml.load(sEvent);
    } else {
      event = JSON.parse(sEvent);
    }
    msg(`Sending event based on file ${eventFile}...`);
    axios.post(url(host, port, '/api/v1/event'), {
        method: event.method,
        result: event.result
      })
      .then(function (response) {
        console.log('Response received for sending event for user', userId, ':', response.data);
      })
      .catch(function (error) {
        logError(error);
      });
  } catch ( ex ) {
    console.log(`ERROR: File ${eventFile} is either missing or contains invalid JSON or YAML`);
    console.log(ex);
  }

} else if ( parsed.broadcastEvent ) {
  const broadcastEventFile = parsed.broadcastEvent;
  try {
    const sbroadcastEvent = fs.readFileSync(path.resolve(__dirname, broadcastEventFile), {encoding:'utf8', flag:'r'});
    let broadcastEvent;
    if ( broadcastEventFile.endsWith('yaml') || broadcastEventFile.endsWith('yml') ) {
      broadcastEvent = yaml.load(sbroadcastEvent);
    } else {
      broadcastEvent = JSON.parse(sbroadcastEvent);
    }
    msg(`Sending broadcastEvent based on file ${broadcastEventFile}...`);
    axios.post(url(host, port, '/api/v1/broadcastEvent'), {
        method: broadcastEvent.method,
        result: broadcastEvent.result
      })
      .then(function (response) {
        console.log('Response received for sending broadcast event for user', userId, ':', response.data);
      })
      .catch(function (error) {
        logError(error);
      });
  } catch ( ex ) {
    console.log(`ERROR: File ${broadcastEventFile} is either missing or contains invalid JSON or YAML`);
    console.log(ex);
  }

} else if ( parsed.sequence ) {
  const eventFile = parsed.sequence;

  try {
    const sEvent = fs.readFileSync(path.resolve(__dirname, eventFile), {encoding:'utf8', flag:'r'});

    let seqevent;
    if ( eventFile.endsWith('yaml') || eventFile.endsWith('yml') ) {
      seqevent = yaml.load(sEvent);
    } else {
      seqevent = JSON.parse(sEvent);
    }
    msg(`Sending sequence of events based on file ${eventFile}...`);

      axios.post(url(host, port, '/api/v1/sequence'), {seqevent : seqevent})
      .then(function (response) {
        console.log('Response received for sending sequence of events for user', userId, ':', response.data);
      })
      .catch(function (error) {
        logError(error);
    });

  } catch ( ex ) {
    console.log(`ERROR: File ${eventFile} is either missing or contains invalid JSON or YAML`);
    console.log(ex);
  }

} else if ( parsed.session || parsed.sessionOutput || parsed.sessionOutputPath) {
  if ( parsed.session && parsed.session == 'start' ) {
    msg(`Starting session...`);
    try {
      let response = await axios.post(url(host, port, '/api/v1/session/start'), undefined);
      console.log('Response received for starting session for user', userId, ':', response.data);
    } catch (error) {
      logError(error);
    }
  }

  if ( parsed.sessionOutput ) {
    const sessionOutput = parsed.sessionOutput;
    msg(`Set session output to "${sessionOutput}"`);
    try {
      let response = await axios.post(url(host, port, `/api/v1/sessionoutput/${sessionOutput}`), undefined);
      console.log('Response received for setting session output for user', userId, ':', response.data);
    } catch (error) {
      logError(error);
    }
  }

  if ( parsed.sessionOutputPath ) {
    const sessionOutputPath = parsed.sessionOutputPath;
    msg(`Set session output path to: ` + sessionOutputPath);
    try {
      let response = await axios.post(url(host, port, '/api/v1/sessionoutputpath'), { path : sessionOutputPath });
      console.log('Response received for setting session output path for user', userId, ':', response.data);
    } catch (error) {
      logError(error); 
    }
  }

  if ( parsed.session && parsed.session == 'stop' ) {
    msg(`Stopping session...`);
    axios.post(url(host, port, '/api/v1/session/stop'), undefined)
    .then(function (response) {
      console.log('Response received for stopping session for user', userId, ':', response.data);
    }
    ).catch(function (error) {
      logError(error);
    });    
  }

} else if (parsed.getStatus) {
  axios.get(url(host, port, '/api/v1/status'), undefined)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      logError(error);
    });
} else if (parsed.downloadOverrides) {
  /* overrideDirectory is mock-firebolt/cli/externalOverrides by default, 
  if overrided via CLI, will have user given location to save repository contents */
  const overrideDirectory = parsed.overrideLocation ? parsed.overrideLocation : getAppRootDir() + '/cli/externalOverrides'
  // git repository url to be downloaded
  const downloadUrl = parsed.downloadOverrides;

  // cloning git repository into a temporary folder using tmp node library
  msg(`Downloading github repository ${downloadUrl}...`);
  const tmpobj = tmp.dirSync();
  const tmpFolder = (tmpobj.name).replace(/\\/g, "/");
  shell('git -C ' + tmpFolder + ' clone ' + downloadUrl + '').then((res) => {

    // copying the file contents inside temporary folder to overrideDirectory, once successfully cloned
    if (res.code == 0) {
      var files = fs.readdirSync(tmpobj.name)[0];
      shell('rm -rf ' + tmpFolder + '/' + files + '/.git').then(() => {
        shell('cp -R ' + tmpFolder + '/' + files + '/. ' + overrideDirectory).then((res) => {
          msg(`Copying downloaded contents to ${overrideDirectory}`);

          // removing the temporary folder
          shell('rm -rf ' + tmpFolder).then((res) => {
            msg(`Cleaning up..`);
            if (res.code !== 0) {
              logger.error(res.stderr)
            }
          })
          // throw error if copying files not successful
          if (res.code !== 0) {
            logger.error(res.stderr)
          }
        })
      })
      // throw error if cloning repository not successful
    } else {
      logger.error(res.stderr)
    }
  })
}
else {
  console.log('Invalid command-line arguments. No action taken.');
}
