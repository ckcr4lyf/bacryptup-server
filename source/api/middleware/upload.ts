/**
 * This middleware checks if the headers are set appropriately for a file upload
 * It also verifies if we have enought free space to upload this file (from redis)
 */

import { Request, Response, NextFunction, } from 'express';
import { FILE_LIMIT, MAX_EXPIRY, TOTAL_SPACE } from '../../config';
import redis from '../../redis/redis';
import Logger from '../../utilities/logger';

export default async (req: Request, res: Response, next: NextFunction) => {

    const filename = req.headers['x-filename'];
    const iv = req.headers['x-iv'];
    const fileSize = req.headers['x-file-size'];
    const expiry = req.headers['x-expiry'];
    const logger = new Logger("UPLOAD MIDDLEWARE");

    logger.info(`Checking upload request params`);

    if (filename === undefined || filename === '' || typeof filename === 'object'){
        return res.status(400).end();
    }
    
    if (iv === undefined || iv === '' || typeof iv === 'object'){
        return res.status(400).end();
    }

    if (expiry === undefined || expiry === '' || typeof expiry === 'object'){
        return res.status(400).end();
    }

    const parsedExpiry = parseInt(expiry);

    if (isNaN(parsedExpiry) || parsedExpiry > MAX_EXPIRY){
        return res.status(400).end();
    }

    if (fileSize === undefined || fileSize === '' || typeof fileSize === "object"){
        return res.status(400).end();
    }

    const parsedFileSize = parseInt(fileSize);

    if (isNaN(parsedFileSize)){
        return res.status(400).end();
    }

    if (parsedFileSize > FILE_LIMIT){
        return res.status(413).end();
    }

    let spaceUsed: number;

    try {
        spaceUsed = await redis.incrby('SPACE_USED', parsedFileSize);
    } catch {
        logger.error(`Redis query failed`);
        return res.status(500).json({
            "error": "REDIS_QUERY_FAILED"
        });
    }

    if (spaceUsed > TOTAL_SPACE){
        res.status(200).json({
            "error": "NO_SPACE_LEFT"
        });

        redis.decrby('SPACE_USED', parsedFileSize);
        return;
    }

    req.__filename = filename;
    req.__fileSize = parsedFileSize;
    req.__expiry = parsedExpiry;
    req.__iv = iv;

    next();
}