const file = require('../../db/file');
const AWS = require('aws-sdk');

// GET /v1/file/:id
module.exports = (req, res) => {

    const id = req.params.id;

    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    const BUCKET_NAME = "ezbkup";

    let s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });
    
    file.findOne({
        "uniq_id": id
    }, (err, doc) => {
        if (err || !doc){

            res.status(404).json({
                "error": "File not found"
            });

        } else {

            const params = {
                Bucket: BUCKET_NAME,
                Key: doc.s3_path
            };

            const url = s3.getSignedUrl('getObject', params);
            const docToSend = {
                iv: doc.iv,
                key: doc.key,
                original_name: doc.original_name,
                size: doc.size
            }

            res.json({
                "doc": docToSend,
                "url": url
            });
        }
    });
}