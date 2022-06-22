'use strict';
import { getUserIdFromReq } from '../../util.mjs';
import {executeSequence} from '../../sequenceManagement.mjs';

//Execute sequence events with respective delay values
function sendSequence(req, res) {
    let seqevent = req.body
    const { ws } = res.locals; // Like magic!
    const userId = getUserIdFromReq(req);

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
        executeSequence(ws, userId, method_name, result_val,`${method_name}`, atTime_val);
    }
    res.status(200).send({
        status: 'SUCCESS'
    });

}

export { sendSequence };
