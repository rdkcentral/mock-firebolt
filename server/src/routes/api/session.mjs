'use strict';

import { logger } from '../../logger.mjs';
import {startRecording, stopRecording} from '../../messageHandler.mjs';

// --- Route Handlers ---

// POST /api/v1/session
function toggleSession(req, res) {
    if ( req.query.start == 'true' ) {
        logger.info('Starting session');
        startRecording();
        res.status(200).send({
            status: 'SUCCESS'
        });
    } else {
        logger.info('Stopping session');
        const sessionFile = stopRecording();
        res.status(200).send({
            status: 'SUCCESS',
            sessionFile: sessionFile
        });
    }
}

function startSession(req, res) {
    logger.info('Starting session');
    startRecording();
    res.status(200).send({
        status: 'SUCCESS'
    });
}

function stopSession(req, res) {
    logger.info('Stopping session');
    const sessionFile = stopRecording();
    // Make this actually return a file
    // res.download(sessionFile);
    res.status(200).send({
        status: 'SUCCESS',
        sessionFile: sessionFile
    });
}

// --- Exports ---
export {
    toggleSession,
    startSession,
    stopSession
};
