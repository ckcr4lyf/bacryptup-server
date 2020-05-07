//Go through files in database
//Delete files at expiry

const { freeAnonSpace, freeUserSpace } = require('./size_lock');
const file = require('../db/file');
const AWS = require('aws-sdk');

const AWS_KEY_ID = process.env.AWS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

const BUCKET_NAME = "ezbkup";

const cleaner = () => {

    console.log(`[CLEANER] Starting job...`);

    let s3 = new AWS.S3({
        accessKeyId: AWS_KEY_ID,
        secretAccessKey: AWS_SECRET_KEY
    });

    let params = {
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: []
        }
    }

    file.find({
        expiry: {"$lt": Date.now()}
    }).exec((err, docs) => {

        if (err){
            console.log("[CLEANER] Failed to query", err);
        } else {
            // console.log(docs);  

            let anonBytes = 0;
            let userBytes = 0;
            let toDelete = [];

            for (let i = 0; i < docs.length; i++){
                if (docs[i].anon == true){
                    anonBytes += docs[i].size;
                } else {
                    userBytes += docs[i].size;
                }

                toDelete.push({
                    Key: docs[i].s3_path
                });
            }

            if (toDelete.length == 0){
                console.log(`[CLEANER] Nothing to delete...`);
                return;
                // process.exit(0);
            } else {
                console.log(`[CLEANER] Found ${toDelete.length} files to delete...`);
            }
            
            params.Delete.Objects = toDelete
            // console.log(params);

            s3.deleteObjects(params, (err, results) => {

                if (err){
                    console.error("Delete failed", err, results);
                    return;
                }

                console.log(`[CLEANER] Deleted ${results.Deleted.length} files from S3 with ${results.Errors.length} errors.`);

                let deleted = results.Deleted.map(el => {
                    return el.Key;
                });

                file.deleteMany({
                    s3_path: {"$in": deleted}
                }).exec(async (merr, mres) => {

                    if (merr){
                        console.log(`[CLEANER] Error deleting object from DB`);
                    } else {

                        try {
                            await Promise.all([freeAnonSpace(anonBytes), freeUserSpace(userBytes)]);
                            console.log(`[CLEANER] Updated LOCK files`);
                        } catch (e){
                            console.log(`[CLEANER] Failed to update LOCK files`);
                        }
                    }
                });
            });
        }
    });
}

module.exports = cleaner;