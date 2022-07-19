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

// session management

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
    }

    exportSession(){
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
            const sessionDataFile = `./sessions/FireboltCalls_${this.#sessionStart}.json`;
            // logger.info(`Saving session data to ${sessionDataFile}`);
            fs.writeFileSync(sessionDataFile, sessionDataJson);
            return sessionDataFile;
        } catch (error) {
            logger.error("Error exporting session: " + error);
            return null;
        }
        
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
    const call = new FireboltCall("Test Method", "Test Parameters");
    sessionRecording.recordedSession.calls.push(call);
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
        sessionRecording.recordedSession.calls.push(call);
    }
}

export {Session, FireboltCall, startRecording, stopRecording, addCall, isRecording};
