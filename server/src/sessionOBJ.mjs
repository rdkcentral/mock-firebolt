
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
        this.#sessionEnd = Date.now();
        const sessionData = {
            sessionStart: this.#sessionStart,
            sessionEnd: this.#sessionEnd,
            calls: this.calls
        };
        const sessionDataJson = JSON.stringify(sessionData);
        const sessionDataFile = `FireboltCalls_${this.#sessionStart}.json`;
        fs.writeFileSync(sessionDataFile, sessionDataJson);
    }
}

export {Session, FireboltCall};
