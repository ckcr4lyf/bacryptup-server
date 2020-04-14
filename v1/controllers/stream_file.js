const file = require('../../db/file');
const Backup = require('../../db/backup');
const User = require('../../db/user');
const shortid = require('shortid');
const AWS = require('aws-sdk');

// POST /v1/stream
module.exports = (req, res) => {

    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    const BUCKET_NAME = "ezbkup";

    const DEFAULT_FOLDER = "solo";

    let s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY
    });

    const id = shortid.generate();
    let targetName;
    let backup = null;

    if (req.backupId){
        targetName = req.accessToken + '/' + req.backupId + '/' + id + '_' + req.filename;
        backup = {
            user: req.accessToken,
            backupId: req.backupId
        }
    } else {
        targetName = DEFAULT_FOLDER + '/' + id + '_' + req.filename;
    }

    let sizeFlag = false;

    let params = {
        Bucket: BUCKET_NAME,
        Key: targetName,
        Body: req
    }

    let fileObj = {
        original_name: req.filename,
        s3_path: targetName,
        uniq_id: id,
        user: req.user.accessToken
    }

    if (typeof req.contentLength == "number" && !isNaN(req.contentLength)){
        console.log(`Set ContentLength to ${req.contentLength}`);
        params.ContentLength = req.contentLength;
        fileObj.size = req.contentLength;
        sizeFlag = true;
    }

    if (req.iv){
        fileObj.iv = req.iv;
    }

    if (req.key){
        fileObj.key = req.key;
    }
    

    let progress = s3.upload(params, function(err, data) {

        if (err) {
            res.status(500).json(err);
            return;
        }

        fileObj.etag = data.Etag;

        file.create(fileObj, (err, fileDoc) => {
            if (err) {
                res.status(500).json({
                    "error": "Failed to save file data to DB"
                });

                return;
            }

            console.log(req.user);
            req.user.spaceUsed += fileObj.size;

            req.user.save((err, doc) => {
                if (err){
                    console.log(`Failed to save user`);
                } else {
                    console.log(`Updated user's space usage`);
                }
            })

            if (backup){
                //We have to add info to backup object as well
                backup.uniqId = id;
                Backup.create(backup, (err, backupDoc) => {
                    if (err){
                        res.status(500).json({
                            "error": "Failed to save backup data"
                        });

                        return;
                    }

                    res.status(201).json({
                        "status": "success",
                        "backupId": backup.backupId,
                        "fileId": id
                    });
                });
            } else {
                res.status(201).json({
                    "status": "success",
                    "fileId": id
                });
            }
        });
    });

    progress.on("httpUploadProgress", p => {
        console.log(`Upload progress for ${id}: ${p.loaded}/${p.total}`);

        if (sizeFlag == false && typeof p.total == "number"){
            console.log(`Set filesize during HTTP progress to ${p.total}`);
            fileObj.size = p.total;
            sizeFlag = true;
        }        
    });
}