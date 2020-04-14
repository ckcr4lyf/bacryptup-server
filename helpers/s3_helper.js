const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const shortid = require('shortid');
const file = require('../db/file');

const AWS_KEY_ID = process.env.AWS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const BUCKET_NAME = "ezbkup";

let bucket = new AWS.S3({
    accessKeyId: AWS_KEY_ID,
    secretAccessKey: AWS_SECRET_KEY
});

const storage = multer.diskStorage({
    destination : '../uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const uploadFile = (source, originalName, encryptionKey, iv, res) => {

    console.log("Preparing to upload...");
    
    fs.readFile(source, (err, fileData) => {
        
        if (err){
            console.log("Error reading file.");
            res.status(500).json({
                "error": "Unable to read file"
            });
            
            return;
        }

        //Generate the shortid
        const id = shortid.generate();
        const targetName = id + '_' + originalName;

        let fileObj = {
            original_name: originalName,
            s3_path: targetName,
            uniq_id: id
        };

        if (encryptionKey){
            fileObj.key = encryptionKey;
        }

        if (iv){
            fileObj.iv = iv;
        }

        const putParams = {
            Key: targetName,
            Body: fileData,
            Bucket: BUCKET_NAME
        }

        bucket.putObject(putParams, (err, data) => {
            
            if (err) {
                console.log("Error putting object on S3");
                res.status(500).json({
                    "error": "Failed upload to S3",
                    "body": err
                });

                return;
            }

            // fs.unlink(source, (err) => {
            //     if (err){
            //         console.log("Failed to remove", err);
            //     }
            // });
            
            console.log("Uploaded file to S3");
            fileObj.etag = data.ETag;

            file.create(fileObj, (err, newObj) => {
                if (err) {
                    res.status(500).json({
                        "error": "Failed to save file data to DB"
                    });

                    return;
                }

                res.status(201).json(newObj);
            });
        });
    });
}

module.exports = {
    upload: upload,
    uploadFile: uploadFile
}