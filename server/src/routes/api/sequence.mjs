'use strict';

import { logger } from '../../logger.mjs';
import {executeSequence} from '../../sequenceManagement.mjs';
import * as util from '../../util.mjs';


async function sendSequence(req, res) {
    //Execute sequence events with respective delay values
    setTimeout(function() {executeSequence(req, res); } , req.body.at);

}

export { sendSequence };
