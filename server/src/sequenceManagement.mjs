import { logger } from './logger.mjs';
import {sendEvent} from './routes/api/event.mjs';

function executeSequence(sequence) {
    sequence.forEach(element => {
        let event = element.event;
        let data = element.data;
        logger.info(`Sending event ${event} with data ${JSON.stringify(data)}`);
        // sendEvent(event, data);
    });
}

export { executeSequence };
