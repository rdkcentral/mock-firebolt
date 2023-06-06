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

import kill from "kill-port";
import axios from "axios";
import { exec } from "child_process";
import WebSocket from "ws";
import path from "path";

let mfProcess;
let startMf = "npm run dev";
const mfStarted = "Listening on HTTP port";
const mfHost = "localhost";
const mfUserHeader = "x-mockfirebolt-userid";
const wsClient = "ws://localhost:";

/**
 * To Kill a port
 *
 * @param {Number} portNumber to kill the particular Port
 * @returns Promise yielding success response on resolve() and error on reject()
 */
async function killPort(portNumber) {
  return new Promise((resolve, reject) => {
    try {
      kill(portNumber, "tcp").then(() => {
        resolve("Port Killed");
      });
    } catch (error) {
      console.log("error is", error);
      reject(error);
    }
  });
}

function url(host, port, path) {
  return `http://${host}:${port}${path}`;
}

/**
 * To run MF ws commands
 *
 * @param {String} command the command which we need to execute
 * @param {Number} port ws port to connect
 * @param {String} user to pass the userID
 * @returns Promise yielding the response on resolve()
 */
async function fireboltCommand(command, port, user) {
  //TODO - websocket need not to be init all the time, it needs to be handled to init once and close the connection once testing completed.
  return new Promise((res) => {
    //Establish a WS connection to MF living at port 9998
    //Send the firebolt command given by "command"
    //Return the response from MF
    //TODO - wsClient is added for testing, it needs to be moved to differnt method to init WS client
    const wsClientURL = `${wsClient}${port || 9998}${user ? `/${user}` : ""}`;
    const ws = new WebSocket(wsClientURL);
    ws.on("open", function open() {
      ws.send(command);
    });

    ws.on("message", function message(data) {
      console.log("received: %s", data);
      res(data);
      ws.close();
    });
  });
}

/**
 *
 * Make an HTTP call to MF using an auto-generated host:port
 *
 * @param {String} path The API path for MF
 * @param {String} user Optional MF User
 * @param {String} body Optional body for POST/PUT/etc requests
 * @param {String} method Optional HTTP Method to use (Default is GET/POST)
 * @param {Number} httpPort Optional http port
 * @return Promise yielding an axios response on resolve() and error on reject()
 */
async function callApi(path, user, body, method, httpPort) {
  let fullUrl = url(mfHost, httpPort || 3333, path);

  let headers = user
    ? {
        mfUserHeader: user,
      }
    : {};

  return new Promise((res, rej) => {
    if (body) {
      if (method == undefined || method == null || method == "POST") {
        try {
          axios.post(fullUrl, body, headers).then((response) => {
            res(response);
          });
        } catch (err) {
          rej(err);
        }
      } else {
        //Try to use the method provided in "method"
        try {
          axios[method](fullUrl, body, headers).then((response) => {
            res(response);
          });
        } catch (err) {
          rej(err);
        }
      }
    } else {
      if (method == undefined || method == null || method == "GET") {
        try {
          axios.get(fullUrl, headers).then((response) => {
            res(response);
          });
        } catch (err) {
          rej(err);
        }
      } else {
        try {
          axios[method](fullUrl, headers).then((response) => {
            res(response);
          });
        } catch (err) {
          rej(err);
        }
      }
    }
  });
}

/**
 * To run the cli commands
 *
 * @param {String} command which command to execute
 * @param {Boolean} isWithoutPredefinedPath is user defined path exists or not
 * @returns Promise yielding the response on resolve()
 */
async function callMfCli(command, isWithoutPredefinedPath = false) {
  //Send a command via cli/cli.mjs and return the response
  //Ex: callMfCli(command) should generate a call to the CLI like
  //"node cli/src/cli.mjs <command>"
  return new Promise((resolve) => {
    exec(
      isWithoutPredefinedPath ? command : `node ../cli/src/cli.mjs ${command}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("Error while running the cli command ", err);
          process.exit(1);
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`);
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`);
          if (!stdout && stderr) {
            resolve(stderr.toString());
          } else {
            resolve(stdout.toString());
          }
        }
      }
    );
  });
}

/**
 *
 * Start or stop the MF server
 *
 * @param {Boolean} on True to start MF. False to terminate
 * @param {String} extraConfig optional to pass extra config
 * @returns A Promise that will res() on success or rej() on failure
 */
async function mfState(on, extraConfig = "") {
  return new Promise((res, rej) => {
    if (on) {
      //MF is already running
      if (mfProcess && mfProcess.pid) {
        res("MF process already started. PID: " + mfProcess.pid);
      }

      const dirName = path.resolve("../server");
      let process = exec(`cd ${dirName} && ${startMf}${extraConfig}`);

      //Wait for "Listening on HTTP port" message for MF startup
      process.stdout.on("data", (data) => {
        if (data.includes(mfStarted)) {
          mfProcess = process;
          res("MF started successfully");
        }
      });

      process.on("error", (err) => {
        rej("MF not started successfully: " + JSON.stringify(err));
      });

      process.on("close", (code) => {
        rej("MF not started. Terminated with code " + code);
      });
    } else {
      if (mfProcess && mfProcess.pid) {
        if (mfProcess.kill("SIGTERM")) {
          res("MF terminated successfully");
        } else {
          rej("Unable to terminate MF process");
        }
      } else {
        res("No MF process running");
      }
    }
  });
}

export { fireboltCommand, callApi, callMfCli, mfState, killPort };
