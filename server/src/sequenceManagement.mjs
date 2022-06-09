import { logger } from './logger.mjs';
import {sendEvent} from './routes/api/event.mjs';

function executeSequence(req,res) {

  //function handling events 
  sendEvent(req,res);
  
}

export { executeSequence };
