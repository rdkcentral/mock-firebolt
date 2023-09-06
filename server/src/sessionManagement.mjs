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

// Session Management

'use strict';

import { logger } from './logger.mjs';
import fs from 'fs';
import yaml from 'js-yaml';
import WebSocket from 'ws';
import { validate as uuidValidate } from 'uuid';

const wsRegex = /^(ws(s)?):\/\//i;

class SessionHandler {
  constructor() {
    this.mode = null;
    this.ws = null;
    this.stream = null;
  }

  // Determine mode based on directory/url
  _determineMode(dir) {
    if (wsRegex.test(dir)) {
      this.mode = 'websocket';
    } else {
      this.mode = 'filestream';
    }
  }

  open(dir, userId) {
    this._determineMode(dir);

    if (this.mode === 'websocket') {
      try {
        this.ws = new WebSocket(dir);

        this.ws.on('open', () => {
          logger.info(`Websocket connection opened: ${dir}`);
        });

        // Handle connection errors without killing the entire Node application
        this.ws.on('error', (error) => {
          logger.error(`Failed to connect to Websocket server at ${dir}: ${error}`);
          this.ws = null;
        });
      } catch (err) {
        logger.error(`Failed to initialize Websocket: ${error}`);
      }
     
    } else {
      if (!fs.existsSync(dir)) {
        logger.info("Directory does not exist for: " + dir);
        fs.mkdirSync(dir, { recursive: true });
      }

      this.stream = fs.createWriteStream(`${dir}/FireboltCalls_${userId}_live.log`, { flags: 'a' });
    }
  }

  write(data) {
    if (this.mode === 'websocket' && this.ws) {
      this.ws.send(data); 
    } else if (this.stream) {
      this.stream.write(`${data}\n`);
    }
  }

  close() {
    if (this.mode === 'websocket' && this.ws) {
      this.ws.close();
      this.ws = null;
    } else if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}

class FireboltCall {
    constructor(methodCall, params) {
        this.methodCall = methodCall;
        this.params = params;
        this.timestamp = Date.now();
    }
}

class Session {
    #sessionStart;
    #sessionEnd;
    
    constructor(userId){
        this.userId = userId;
        this.calls = [];
        this.#sessionStart = Date.now();
        this.sessionOutput = "log";
        this.sessionOutputPath = `./output/sessions/${this.userId}`;
        this.mockOutputPath = `./output/mocks/${this.userId}/${this.#sessionStart}`;
        this.sessionHandler = new SessionHandler();
    }

    exportSession() {
        try {
            this.#sessionEnd = Date.now();
            const sessionData = {
                sessionStart: this.#sessionStart,
                sessionEnd: this.#sessionEnd,
                calls: this.calls
            };
            const sessionDataJson = JSON.stringify(sessionData, null, 4);
            // TODO: convert this.#sessionStart to a yyyy-mm-dd_hh:mm:ss format for readable filenames

            // const sessionStart = new Date(this.#sessionStart);
            // const sessionStartString = sessionStart.toISOString().replace(/T/, '_').replace(/\..+/, '');
            // logger.info(`${sessionStart.toISOString()}`);    

            // Check if the output path is a WebSocket URL
            this.sessionOutputPath = wsRegex.test(this.sessionOutputPath) ? "./sessions/output" : this.sessionOutputPath;

            if (!fs.existsSync(this.sessionOutputPath)) {
                logger.info("Directory does not exist for: " + this.sessionOutputPath)
                fs.mkdirSync(this.sessionOutputPath, { recursive: true});
            }
            const sessionDataFile = this.sessionOutputPath + `/FireboltCalls_${this.#sessionStart}_${this.sessionOutput}.json`;

            let returnStmt = null; // creating a return message
            if (this.sessionOutput == 'raw') {
                fs.writeFileSync(sessionDataFile, sessionDataJson);
                returnStmt = `Succesfully wrote output in raw format to ${sessionDataFile}`;
            } else if (this.sessionOutput == "mock-overrides") {
                this.convertJsonToYml(sessionDataJson);
                returnStmt = `Succesfully wrote output in mock-overrides format to ${this.mockOutputPath}`;
            } else {
                //emit this json in time order.
                this.sortJsonByTime(sessionData, sessionDataFile);
                returnStmt = `Succesfully wrote output in log format to ${sessionDataFile}`;
            }

            return returnStmt;
        } catch (error) {
            logger.error("Error exporting session: " + error);
            console.log(error.stack);
            return null;
        }
        
    }

    convertJsonToYml(jsonReport) {
        if (!fs.existsSync(this.mockOutputPath)) {
            logger.info("Mock directory does not exist for: " + this.mockOutputPath)
            fs.mkdirSync(this.mockOutputPath, { recursive: true});
        }
        let repetition = false;
        try {
            jsonReport = JSON.parse(jsonReport);
        } catch (e) {
            console.error('Invalid Input format', e);
            return e;
        }

        let methodCallsWritten = []; // creating an array to track which calls have already been written
        for ( let i = 0; i < jsonReport.calls.length; i++) {
            // skip methods containing .on & Changed in fullTitle and .Subscribe (SKIPPING THE SUBSCRIBE VALIDATION AS WE ARE NOT CURRENTLY LOGGING) in title
            if (jsonReport.calls[i].methodCall.indexOf('.on') !== -1 && jsonReport.calls[i].methodCall.indexOf('Changed') !== -1) {
                continue;
             } else if (methodCallsWritten.includes(jsonReport.calls[i].methodCall)) { // if already added because of multiple can skip
                continue;
             } else {
                let calls = jsonReport.calls;
                let multipleExampleFlag = false;
                let multipleExampleContext = [];
                let multipleParams;
                let methodName;

                // skip .Subscribe (SKIPPING THE SUBSCRIBE VALIDATION AS WE ARE NOT CURRENTLY LOGGING) methods
                for ( let j = i+1; j < calls.length; j++) { // iterate over rest of calls                     
                    if (j < (calls.length) &&  calls[i].methodCall === calls[j].methodCall) { // looking for matching method calls
                        multipleParams = {};

                        // Then add the matching method call
                        // keeping result as null for methods having CertError else keeping result
                        if (calls[j].error && calls[j].error.code == 'CertError' && calls[j].error.message == 'Received response as undefined') {
                            multipleParams["paramDetails"] = {
                                "result": null
                            };
                        } else if (calls[j].response.error) { // if there is an error we want that under 'result'
                            multipleParams["paramDetails"] = {
                                "result": calls[j].response
                            };
                        } else { // if no error than we need to take out one level of 'result'
                            multipleParams["paramDetails"] = {
                                "result": calls[j].response.result
                            };
                        }
                        multipleParams["paramDetails"].param = calls[j].params ? calls[j].params : {};
                        // to check repetition of params
                        repetition = this.checkParams(multipleExampleContext,multipleParams);
                        if(!repetition) {
                            multipleExampleContext.push(multipleParams);
                            methodCallsWritten.push(calls[j].methodCall);
                        }
                        multipleExampleFlag = true;
                    }
                }


                //yaml file generation for methods with more than one example
                if (multipleExampleFlag) { // if we ran into mulitple example we need to add i the first one since the j loop would have skipped it
                    multipleParams = {};
                    if ( calls[i].error && calls[i].error.code == 'CertError' && calls[i].error.message == 'Received response as undefined') {
                       multipleParams["paramDetails"] = {
                          "result": null
                       };
                    } else if (calls[i].response.error) { // if there is an error we want that under 'result'
                        multipleParams["paramDetails"] = {
                            "result": calls[i].response
                         };
                    } else { // if no error than we need to take out one level of 'result'
                       multipleParams["paramDetails"] = {
                          "result": calls[i].response.result
                       };
                    }
                    multipleParams["paramDetails"].param = calls[i].params ? calls[i].params : {};
                    // to check repetition of params
                    repetition = this.checkParams(multipleExampleContext,multipleParams);
     
                    if(!repetition) {
                       multipleExampleContext.push(multipleParams);
                       methodCallsWritten.push(calls[i].methodCall);
                       repetition = false;
                    }
                    
                    if (multipleExampleContext.length > 1) { // making sure it is acutally multiple examples and was not just multiple duplicates
                        let responseContent = this.handleMultipleExampleMethod(calls[i].methodCall, multipleExampleContext);
                        methodName = calls[i].methodCall;
                        let state = {
                        "methods": {
                            [methodName]: {
                                "response": responseContent
                            }
                        }
                        };
                        let yamlStr = yaml.dump(state);
                        try {
                            fs.writeFileSync(`${this.mockOutputPath}/${methodName}.yaml`, yamlStr);
                        } catch(e) {
                            console.error('Invalid Output Directory', e);
                            return e;
                        }
                    } else {
                        multipleExampleFlag = false;
                    }
                }

                // json file generation for methods with only one example
                if (!multipleExampleFlag) {
                    let staticObject = {};
                    staticObject["methods"] = calls[i].methodCall;
                    methodName = calls[i].methodCall;
                    let obj;
    
                    obj = this.handleSingleExampleMethod(calls,staticObject,methodName,obj,i);
                    let data = JSON.stringify(obj, null, 2);
                    try {
                        fs.writeFileSync(`${this.mockOutputPath}/${methodName}.json`, data);
                    } catch(e) {
                        console.error('Invalid Output Directory', e);
                        return e;
                    }
                }
            }
        }
    }

    // Returns json object for methods with only one example
    handleSingleExampleMethod(calls,staticObject,methodName,obj,i){
        // handling result/ error/ CertError
        if (calls[i].hasOwnProperty('response')) {
            if ( calls[i].error && calls[i].error.code == 'CertError' && calls[i].error.message == 'Received response as undefined') {
                staticObject["result"] = null;
            } else if (calls[i].response.error) {
                staticObject["result"] = calls[i].response;
            } else if (calls[i].response || calls[i].response === false) {  // if no error than we need to take out one level of 'result'
                staticObject["result"] = calls[i].response.result;
            }
        }
        obj = {
            "methods": {
                [methodName]: {
                    "result": staticObject["result"]
                }
            }
        };
        return obj;
    }


    // Serializing context for yaml generation
    // Returns the JS source code for the response function
    handleMultipleExampleMethod(method, contexts) {
        let arrResult = [];
        let responseContent = "function (ctx,params){" + "\n";
        let defaultResult;
        let ifStmt = "   if(";
    
        // traversing thorugh all methods-contexts
        for (let i = 0; i < contexts.length; i++) {
            arrResult = [];
            let param = Object.keys(contexts[i].paramDetails.param); // getting object keys as array
        
            // check for null param
            if (param.length == 0) {
                defaultResult = JSON.stringify(contexts[i].paramDetails.result);
            } else {
                arrResult.push(ifStmt);
                for (let j = 0; j < param.length; j++) {
                    // Serializing name-value pair of each param
                    if (j == 0) {
                        if( typeof( contexts[i].paramDetails.param[param[0]]) === "object" ){
                            arrResult.push(`JSON.stringify(params.${param[0]})` + "  ===  '" + JSON.stringify(contexts[i].paramDetails.param[param[0]]) + "'");
                        }
                        else{
                            arrResult.push(`JSON.stringify(params.${param[0]})` + "  ===  " + JSON.stringify(contexts[i].paramDetails.param[param[0]]));
                        }
                    } else {
                        if( typeof( contexts[i].paramDetails.param[param[j]]) === "object" ){
                            arrResult.push(` && JSON.stringify(params.${param[j]})` + "  ===  '" + JSON.stringify(contexts[i].paramDetails.param[param[j]]) + "'");
                        }
                        else{
                            arrResult.push(` && JSON.stringify(params.${param[j]})` + "  ===  " + JSON.stringify(contexts[i].paramDetails.param[param[j]]));
                        }
                    }
                }
                arrResult.push("){\n");
                arrResult.push("      return " + JSON.stringify(contexts[i].paramDetails.result) + '; \n   }\n');
                ifStmt = "   else if(";
            } 
            responseContent += arrResult.join("");
        }
    
        
        if (defaultResult) {
            responseContent += "   else{\n      return " + defaultResult + "; \n   } \n";
        } else {
            responseContent += `   throw new ctx.FireboltError(-32888,'${method} is not working')\n`;        }
        responseContent += '}';
        return responseContent;
    }


    //Returns flag to check the repetition of params
    checkParams(multipleExampleContext,multipleParams){
        let repetition = false;
        for(let j=0; j < multipleExampleContext.length;j++){
            if (JSON.stringify(multipleExampleContext[j]["paramDetails"].param) === JSON.stringify(multipleParams["paramDetails"].param)){
                multipleExampleContext[j] = multipleParams;
                repetition = true;
            }
        }
        return repetition;
    }

    sortJsonByTime(sessionDataJson, sessionDataFile) {
        const recordedJson = {
            sessionStart: sessionDataJson.sessionStart,
            sessionEnd: sessionDataJson.sessionEnd
        }
        const recordings = []
        for(let i = 0; i < sessionDataJson.calls.length; i++) {
            const requestJson = {
                type: "request",
                timestamp: sessionDataJson.calls[i].timestamp,
                sequenceId: sessionDataJson.calls[i].sequenceId,
                method: sessionDataJson.calls[i].methodCall,
                params: sessionDataJson.calls[i].params
            }
            recordings.push(requestJson)
            if(sessionDataJson.calls[i].response) {
                const responseJson = {
                    type: "response",
                    timestamp: sessionDataJson.calls[i].response.timestamp,
                    sequenceId: sessionDataJson.calls[i].sequenceId,
                    method: sessionDataJson.calls[i].methodCall,
                    response: sessionDataJson.calls[i].response
                }
                recordings.push(responseJson)
            }
            const eventJson = {
              type: "event",
              timestamp: sessionDataJson.calls[i].timestamp,
              method: sessionDataJson.calls[i].methodCall,
              events: sessionDataJson.calls[i].response
          }
          recordings.push(eventJson)
        }
        //sort by timestamp ascending
        recordings.sort(function(a,b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        recordedJson.recordings = recordings
        fs.writeFileSync(sessionDataFile, JSON.stringify(recordedJson, null, 4));
        logger.info(`Saving session sorted data to ${sessionDataFile}`);
    }
}

let sessionRecording = {};
const userSessionWsMap = new Map();

function startRecording(userId) {
  logger.info(`Starting recording for user: ${userId}`);
  sessionRecording[userId] = {
    recording: true,
    recordedSession: new Session(userId)
  };
}
  
function stopRecording(userId) {
  if (isRecording(userId)) {
      logger.info(`Stopping recording for user: ${userId}`);
      sessionRecording[userId].recording = false;
      const sessionData = sessionRecording[userId].recordedSession.exportSession();
      
      // Close the session handler
      sessionRecording[userId].recordedSession.sessionHandler.close();
      
      // Close the WebSocket connection to server
      closeSessionWsConnection(userId);
      
      delete sessionRecording[userId];
      return sessionData;
  } else {
      logger.warn('Trying to stop recording when not recording');
      return null;
  }
}

function isRecording(userId) {
  return sessionRecording[userId]?.recording;
}

function associateUserWithSessionWsMap(userId, ws) {
  userSessionWsMap.set(userId, ws);
}

function removeUserFromSessionWsMap(userId) {
  userSessionWsMap.delete(userId);
}

function getWsfromSessionMap(userId) {
  return userSessionWsMap.get(userId) || null;
}

function closeSessionWsConnection(userId) {
  const ws = getWsfromSessionMap(userId);
  if (ws === null) return;

  try {
    ws.close();
    logger.info(`Closed Session WS for userId: ${userId}`);
  } catch (err) {
    logger.error(`Failed to close Session WS for userId: ${userId}. Error: ${err}`);
  }
}

function sendMessageToMatchingSessions(data, userId) {
  userSessionWsMap.forEach((ws, key) => {
    if (key === userId || uuidValidate(key)) {
      ws.send(data);
    }
  });
}

function addCall(methodCall, params, userId) {
    if (isRecording(userId)) {
        const call = new FireboltCall(methodCall, params);
        call.sequenceId = sessionRecording[userId].recordedSession.calls.length + 1;
        sessionRecording[userId].recordedSession.calls.push(call);
        const data = JSON.stringify(call);
        if (sessionRecording[userId].recordedSession.sessionOutput === "live") {
            sessionRecording[userId].recordedSession.sessionHandler.write(data);
        }
        if (sessionRecording[userId].recordedSession.sessionOutput === "server") {
          sendMessageToMatchingSessions(data, userId);
        }
    }
}

function setOutputFormat(format, userId) {
  if (!sessionRecording[userId]) {
      logger.error(`No active session found for user: ${userId}`);
      return;
  }
  sessionRecording[userId].recordedSession.sessionOutput = format;
  logger.info(`Setting output format for user ${userId} to: ${sessionRecording[userId].recordedSession.sessionOutput}`);
}

function getOutputFormat(userId) {
    return sessionRecording[userId].recordedSession.sessionOutput;
}

function setOutputDir(dir, userId) {
  if (sessionRecording[userId].recordedSession.sessionOutput === "live") {
      sessionRecording[userId].recordedSession.sessionHandler.open(dir, userId);
  }
  sessionRecording[userId].recordedSession.sessionOutputPath = dir;
  sessionRecording[userId].recordedSession.mockOutputPath = dir;
  logger.info(`Setting output path for user ${userId}: ${sessionRecording[userId].recordedSession.mockOutputPath}`);
}

function getSessionOutputDir(userId){
    return sessionRecording[userId].recordedSession.sessionOutputPath;
}

function getMockOutputDir(userId){
    return sessionRecording[userId].recordedSession.mockOutputPath;
}

function updateCallWithResponse(method, result, key, userId) {
  if (isRecording(userId)) {
      const methodCalls = sessionRecording[userId].recordedSession.calls;
      for(let i = 0; i < methodCalls.length; i++) {
          if(methodCalls[i].methodCall == method) {
              methodCalls[i].response = {[key]: result, timestamp: Date.now()};
              sessionRecording[userId].recordedSession.calls.concat(...methodCalls);
              const data = JSON.stringify(methodCalls[i]);
              if (sessionRecording[userId].recordedSession.sessionOutput === "live") {
                  sessionRecording[userId].recordedSession.sessionHandler.write(data);
              }
              if (sessionRecording[userId].recordedSession.sessionOutput === "server") {
                  sendMessageToMatchingSessions(data, userId);
              }
          }
      }
  }
}

// Created to return sessionRecording object for unit testcase
function getMockEventCall(userId){
  return sessionRecording[userId].recordedSession.calls;
}

// Utility function for unit tests
function setTestSessionRecording (mockRecording) {
  sessionRecording = mockRecording;
}

export const testExports = {
  setTestSessionRecording,
  setOutputDir,
  getMockEventCall,
  SessionHandler
}

export { Session, FireboltCall, startRecording, setOutputDir, stopRecording, addCall, isRecording, updateCallWithResponse, setOutputFormat, getOutputFormat, getSessionOutputDir, getMockOutputDir, associateUserWithSessionWsMap, removeUserFromSessionWsMap, getWsfromSessionMap,
sendMessageToMatchingSessions, closeSessionWsConnection };