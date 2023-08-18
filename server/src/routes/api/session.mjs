'use strict';

import { logger } from '../../logger.mjs';
import {startRecording, stopRecording, setOutputFormat, setOutputDir} from '../../sessionManagement.mjs';
import { getUserIdFromReq } from '../../util.mjs';

// --- Route Handlers ---

// POST /api/v1/session
function toggleSession(req, res) {
  const userId = getUserIdFromReq(req);
    if ( req.query.start == 'true' ) {
        logger.info('Starting session');
        startRecording(userId);
        res.status(200).send({
            status: 'SUCCESS'
        });
    } else {
        logger.info('Stopping session');
        const sessionFile = stopRecording(userId);
        res.status(200).send({
            status: 'SUCCESS',
            sessionFile: sessionFile
        });
    }
}

function startSession(req, res) {
    logger.info('Starting session');
    const userId = getUserIdFromReq(req);
    startRecording(userId);
    res.status(200).send({
        status: 'SUCCESS'
    });
}

function stopSession(req, res) {
    logger.info('Stopping session');
    const userId = getUserIdFromReq(req);
    const message = stopRecording(userId);
    res.status(200).send({
        status: 'SUCCESS',
        message: message
    });
}

function setOutput(req, res) {
    if (!req.params.format) {
        res.status(400).send({
            status: 'ERROR',
            message: 'Format not found in request parameters'
        });
    }
    const format = req.params.format;
    const userId = getUserIdFromReq(req);
    logger.info(`Setting session output to ${format}`);
    setOutputFormat(format, userId);
    res.status(200).send({
        status: 'SUCCESS'
    });
}

function setOutputPath(req, res) {
    if (!req.body.path) {
        res.status(400).send({
            status: 'ERROR',
            message: 'Path not found in request body'
        });
    }
    logger.info('Setting session output path to: ' + req.body.path);
    const userId = getUserIdFromReq(req);
    setOutputDir(req.body.path, userId);
    res.status(200).send({
        status: 'SUCCESS'
    });
}

// --- Exports ---
export {
    toggleSession,
    startSession,
    stopSession,
    setOutput,
    setOutputPath
};
