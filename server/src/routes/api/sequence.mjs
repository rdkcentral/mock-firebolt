'use strict';

import { logger } from '../../logger.mjs';
import {executeSequence} from '../../sequenceManagement.mjs';

function sendSequence(req, res) {
    logger.info(`Starting processing sequence ${req.body.sequence}`);
    executeSequence(req.body.sequence);
    res.status(200).send({
        status: 'SUCCESS'
    });
}

export { sendSequence };
