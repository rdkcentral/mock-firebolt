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

class FireboltCall {
    constructor(methodCall, params) {
        this.methodCall = methodCall;
        this.params = params;
        this.timestamp = Date.now();
    }
}

class Session{
    #sessionStart;
    #sessionEnd;
    
    constructor(){
        this.calls = [];
        this.#sessionStart = Date.now();
        this.sessionOutput = "log";
        this.sessionOutputPath = "./sessions";
        this.mockOutputPath = `./mocks/${this.#sessionStart}`;
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

            logger.info("inside export Session. checking for direcotry: " + this.sessionOutputPath)
            if (!fs.existsSync(this.sessionOutputPath)) {
                logger.info("Directory did not exist direcotry: " + this.sessionOutputPath)
                fs.mkdirSync(this.sessionOutputPath, { recursive: true});
            }
            const sessionDataFile = this.sessionOutputPath + `/FireboltCalls_${this.#sessionStart}.json`;
            logger.info("Session data file: " + sessionDataFile)
            // logger.info(`Saving session data to ${sessionDataFile}`);
            fs.writeFileSync(sessionDataFile, sessionDataJson);
            //emit this json in time order.
            this.sortJsonByTime(sessionData)

            if (this.sessionOutput == "mock-overrides") {
               this.convertJsonToYml(sessionDataJson);
            }
            return sessionDataFile;
        } catch (error) {
            logger.error("Error exporting session: " + error);
            return null;
        }
        
    }

    convertJsonToYml(jsonReport) {
        if (!fs.existsSync(this.mockOutputPath)) {
            logger.info("Mock directory did not exist direcotry: " + this.mockOutputPath)
            fs.mkdirSync(this.mockOutputPath, { recursive: true});
        }

        for ( let i = 0; i < jsonReport.calls.length; i++) {

        }

    }

    sortJsonByTime(sessionDataJson) {
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
        }
        //sort by timestamp ascending
        recordings.sort(function(a,b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        recordedJson.recordings = recordings
        const sessionDataFile = `./sessions/FireboltCalls_Timestamp_Sorted_${sessionDataJson.sessionStart}.json`;
        fs.writeFileSync(sessionDataFile, JSON.stringify(recordedJson, null, 4));
        logger.info(`Saving session sorted data to ${sessionDataFile}`);
    }
}

let sessionRecording = {
    recording : false,
    recordedSession : new Session()
};

function startRecording(){
    logger.info('Starting recording');
    sessionRecording.recording = true;
    sessionRecording.recordedSession = new Session();
}
  
function stopRecording(){
    if (isRecording()) {
        logger.info('Stopping recording');
        sessionRecording.recording = false;
        return sessionRecording.recordedSession.exportSession();
    } else {
        logger.warn('Trying to stop recording when not recording');
        return null;
    }
}

function isRecording(){
    return sessionRecording.recording;
}

function addCall(methodCall, params){
    if(isRecording()){
        const call = new FireboltCall(methodCall, params);
        call.sequenceId = sessionRecording.recordedSession.calls.length + 1
        sessionRecording.recordedSession.calls.push(call);
    }
}

function setOutput(output){
    logger.info("Setting output. Before setting: " + sessionRecording.recordedSession.sessionOutput);
    sessionRecording.recordedSession.sessionOutput = output;
    logger.info("Setting output. After setting: " + sessionRecording.recordedSession.sessionOutput);
}

function setOutputDir(dir){
    logger.info("Setting output path. Before setting: " + sessionRecording.recordedSession.sessionOutputPath);
    sessionRecording.recordedSession.sessionOutputPath = dir;
    logger.info("Setting output path. After setting: " + sessionRecording.recordedSession.sessionOutputPath);

    logger.info("Setting output path. Before setting: " + sessionRecording.recordedSession.mockOutputPath);
    sessionRecording.recordedSession.mockOutputPath = dir;
    logger.info("Setting output path. After setting: " + sessionRecording.recordedSession.mockOutputPath);
}

export {Session, FireboltCall, startRecording, stopRecording, addCall, isRecording, setOutput, setOutputDir};
function updateCallWithResponse(method, result, key) {
    if(isRecording()) {
        const methodCalls = sessionRecording.recordedSession.calls
        for(let i = 0; i < methodCalls.length; i++) {
            if(methodCalls[i].methodCall == method) {
                methodCalls[i].response = {[key]: result, timestamp: Date.now()}
                sessionRecording.recordedSession.calls.concat(...methodCalls);
            }
        }
    }
}

export {Session, FireboltCall, startRecording, stopRecording, addCall, isRecording, updateCallWithResponse};
