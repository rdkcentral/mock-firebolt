
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

export {Session, FireboltCall};
