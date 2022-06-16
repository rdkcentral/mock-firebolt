import { logger } from './logger.mjs';
import {sendEvent} from './routes/api/event.mjs';

function executeSequence(req,res, sendSuccessFlag) {
  //function handling events
  const jsonObject = JSON.parse(JSON.stringify(req.body));
  setTimeout(function(jsonObject) {
    sendEvent({body: jsonObject}, res,sendSuccessFlag);
  }, jsonObject.atTime_val, jsonObject);

}

export { executeSequence };
