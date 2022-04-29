'use strict';

import { logger } from '../../logger.mjs';

// --- Route Handlers ---

// POST /api/v1/session
function toggleSession(req, res) {
    if ( req.query.start == 'true' ) {
        logger.info('Starting session');
        res.status(200).send({
            status: 'SUCCESS'
        });
    } else if ( req.query.stop == 'true' ) {
        logger.info('Stopping session');
        res.status(200).send({
            status: 'SUCCESS'
            //do actual stuff here
        });
    }
}

function startSession(req, res) {
    logger.info('Starting session');
    res.status(200).send({
        status: 'SUCCESS'
    });
}

function stopSession(req, res) {
    logger.info('Stopping session');
    res.status(200).send({
        status: 'SUCCESS'
        //do actual stuff here
    });
}

// --- Exports ---
export {
    toggleSession,
    startSession,
    stopSession
};
