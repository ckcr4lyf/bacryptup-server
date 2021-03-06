import { Request, Response } from 'express';
import shortid from 'shortid';
import AWS from 'aws-sdk';
import File, { file } from '../../db/file';
import Logger from '../../utilities/logger';
import { FOLDER_NAME } from '../../config';

export default async (req: Request, res: Response) => {

    const id = shortid();
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    const BUCKET_NAME = "ezbkup";
    const logger = new Logger('NEW_FILE');
    const s3Path = FOLDER_NAME + '/' + id + '_' + req.__filename;

    const s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });

    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: s3Path,
        Body: req
    }

    const progress = s3.upload(s3Params, async (s3Err: Error, data: AWS.S3.ManagedUpload.SendData) => {

        if (s3Err){
            if (s3Err.name === 'RequestAbortedError'){
                logger.info(`Upload aborted`);

                const deleteParams = {
                    Bucket: BUCKET_NAME,
                    Key: s3Path
                };
    
                s3.deleteObject(deleteParams, (deleteErr, deleteData) => {
                    if(deleteErr === null){
                        logger.info(`Deleted file from S3`);
                    } else {
                        logger.error(`Failed to delete ${id} from S3`);
                    }
                });

                return res.status(400).end();
            } else {
                logger.error(`Failed to upload to S3`);
                return res.status(500).end();
            }
            
            //TODO: Decrement space used in redis?
        }

        const file = {
            originalName: req.__filename,
            s3Path: s3Path,
            iv: req.__iv,
            id: id,
            etag: data.ETag,
            size: req.__fileSize,
            expiry: new Date(Date.now() + req.__expiry)
        };

        logger.info(`Going to save file to MongoDB`);

        try {
            await File.create(file);
            logger.info(`Saved file to MongoDB`);
            return res.status(201).json({
                "status": "success",
                "fileId": id
            });
        } catch {
            logger.error(`Failed to save document to MongoDB`);
            return res.status(500).end();
        }
    });

    let sizeFlag = false;

    progress.on('httpUploadProgress', (p) => {
        if (sizeFlag === false){
            if (p.total > (req.__fileSize + 1024)){
                logger.error(`Client reported ${req.__fileSize} bytes, but AWS returned progress of ${p.total} bytes. Aborting...`);
                progress.abort();
            } else {
                logger.info(`Set filesize during S3 HTTP upload to ${p.total}`);
                sizeFlag = true;
            }
        } else {
            console.log(p);
        }
    })
}