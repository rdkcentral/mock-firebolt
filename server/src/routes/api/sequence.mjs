'use strict';

import { logger } from '../../logger.mjs';
import {executeSequence} from '../../sequenceManagement.mjs';
import * as util from '../../util.mjs';


async function sendSequence(req, res) {
    //Execute sequence events with respective delay values
     //function handling events
    let json = req;
    let seqevent = req.body.seqevent
    //iterating through sequence of events
    for(let i = 0; i < seqevent.length; i++) {
        let method_name = seqevent[i].event.method;
        let result_val = seqevent[i].event.result;
        let atTime_val;
        //adding delay to the previous execution time
        if (seqevent[i].delay){
            atTime_val = seqevent[i-1].at + seqevent[i].delay
        }
        else{
            atTime_val = seqevent[i].at;
        }
        json.body.method = method_name
        json.body.result = result_val
        json.body.atTime_val = atTime_val

        if(i == seqevent.length - 1) {
            executeSequence(json, res, true);
        } else {
            executeSequence(json, res, false);
        }
    }

}

export { sendSequence };
