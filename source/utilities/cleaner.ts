import File, { file } from '../db/file';
import redis from '../redis/redis';
import Logger from './logger';
import AWS from 'aws-sdk';

export default async () => {

    const logger = new Logger('CLEANER');
    const BUCKET_NAME = "ezbkup";
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    logger.info(`Starting cleaner`);

    let toDelete: file[];
    let keysToDelete: {
        Key: string
    }[] = [];
    let bytesToFree = 0;

    try {
        toDelete = await File.find({
            expiry: {
                $lt: new Date()
            }
        });
    } catch {
        logger.error(`Error querying database for files to delete`);
        return;
    }

    if (toDelete.length === 0){
        logger.info(`No files to delete`);
        return;
    }

    logger.info(`Need to delete ${toDelete.length} files`);

    toDelete.forEach(fileDoc => {
        keysToDelete.push({ Key: fileDoc.s3Path });
        bytesToFree += fileDoc.size;
    });

    const s3Params = {
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: keysToDelete
        }
    };

    const s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY
    });

    s3.deleteObjects(s3Params, async (deleteErr, deleteData) => {
        
        if (deleteErr !== null){
            logger.error(`Failed to delete from S3`);
            console.log(deleteErr);
            return;
        }

        const deletedKeys = deleteData.Deleted.map(el => el.Key);
        logger.info(`Deleted ${deletedKeys.length} objects from S3`);
        logger.info(`Going to decrement space used in Redis`);

        //TODO: Only free space for shit deleted in S3?

        try {
            await redis.decrby('SPACE_USED', bytesToFree);
            logger.info(`Freed ${bytesToFree} bytes in redis`);
        } catch {
            logger.error(`Failed to decrement space used in redis`);
        }

        //Delete from our DB
        //TODO: Maybe this is where we calculate stuff to free from redis?

        try {
            await File.deleteMany({
                s3Path: {
                    $in: deletedKeys
                }
            });

            logger.info(`Deleted ${deletedKeys.length} docs from MongoDB`);
        } catch {
            logger.error(`Failed to delete documents from MongoDB`);
        }
    });
}