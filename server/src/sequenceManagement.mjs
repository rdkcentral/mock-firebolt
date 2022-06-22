import {sendEvent} from './events.mjs';

function executeSequence(ws,userId,method_name, result, msg, atTime_val) {

  setTimeout(function() {
    sendEvent(ws, userId, method_name, result,msg,function(){}, function(){}, function(){});
  }, atTime_val);

}

export { executeSequence };
