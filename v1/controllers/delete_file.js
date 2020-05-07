const file = require('../../db/file');
const AWS = require('aws-sdk');
const { freeUserSpace } = require('../../helpers/size_lock');

const AWS_KEY_ID = process.env.AWS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

const BUCKET_NAME = "ezbkup";

/** @type RequestHandler */
module.exports = async (req, res) => {

    const fileId = req.params.id;
    const accessToken = req.headers['x-access-token'];

    if (!accessToken){
        res.status(400).send();
    }

    let theFile = await file.findOne({
        uniq_id: fileId,
        user: accessToken
    });

    if (theFile){
        let key = theFile.s3_path;

        let s3 = new AWS.S3({
            accessKeyId: AWS_KEY_ID,
            secretAccessKey: AWS_SECRET_KEY
        });

        let params = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        s3.deleteObject(params, async (err, data) => {
            if (err){
                console.log(`[DELETE ENDPOINT] Delete failed for ${key}`);
                console.log(err);
                res.status(500).send();
            } else {
                console.log(`[DELETE ENDPOINT] Successfully deleted ${key} from S3`);
                
                try {
                    await freeUserSpace(theFile.size);
                } catch (e){
                    console.log(`[DELETE ENDPOINT] Error freeing space in the lock file...`);
                    console.log(e);
                }

                res.status(204).send();
                theFile.remove();
            }
        });

    } else {
        res.status(404).send();
    }
    // res.json(theFile);
}