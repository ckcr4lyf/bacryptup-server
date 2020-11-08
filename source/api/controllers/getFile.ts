import { Request, Response } from 'express';
import File, { file } from '../../db/file';
import AWS from 'aws-sdk';
import Logger from '../../utilities/logger';

export default async (req: Request, res: Response) => {

    const id = req.params.id;
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    const BUCKET_NAME = "ezbkup";
    const logger = new Logger('GET_FILE');

    const s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });

    let file: file = undefined;

    try {
        file = await File.findOne({
            id: id
        });
    } catch {
        logger.error(`Error querying MongoDB for file ${id}`);
        return res.status(500).json({
            "error": "DB_QUERY_ERROR"
        });
    }

    if (file === undefined || file === null){
        logger.warn(`File ${id} not found!`);
        return res.status(404).json({
            "error": "FILE_NOT_FOUND"
        });
    }

    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: file.s3Path
    };

    let signedUrl: string = undefined;

    try {
        signedUrl = await s3.getSignedUrlPromise('getObject', s3Params);
    } catch {
        logger.error(`Error getting signed URL from AWS for file ${id}`)
        return res.status(500).json({
            "error": "AWS_QUERY_ERROR"
        });
    }

    res.status(200).json({
        iv: file.iv,
        originalName: file.originalName,
        size: file.size,
        url: signedUrl
    })
}