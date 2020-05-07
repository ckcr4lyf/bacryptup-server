const User = require('../../db/user');
const CONSTANTS = require('../../constants');
const { newAnonFile, newFreeFile } = require('../../helpers/size_lock');

module.exports = async (req, res, next) => {

    let filename = req.headers['filename'];
    let accessToken = req.headers['x-access-token'];
    let anon = false;
    let QUOTA = 0;

    req.accessToken = accessToken;

    if (!req.accessToken){
        anon = true;
        req.user = undefined;
        QUOTA = CONSTANTS.ANON_FILE_LIMIT;

        console.log(`[UPLOAD MIDDLEWARE] Anonymous upload...`);
        //Captcha check
    } else {

        let user = await User.findOne({
            accessToken: accessToken
        });
    
        //Remove this if allow anonymous
        if (!user){
            res.status(404).json({
                "error": "No user"
            });

            return;
        }

        req.user = user;
        QUOTA = CONSTANTS.USER_FILE_LIMIT;
    }

    req.iv = req.headers['x-iv'];

    if (!req.iv){
        res.status(400).json({
            "error": "Missing IV"
        });
        return;
    }

    req.originalSize = parseInt(req.headers['x-original-size']);

    if (isNaN(req.originalSize)){
        res.status(400).json({
            "error": "Bad filesize"
        });

        return;
    }

    if (req.originalSize > QUOTA){
        res.status(413).json({
            "error": "File too large"
        });

        return;
    }

    if (!anon && (req.originalSize + req.user.spaceUsed) > CONSTANTS.PER_USER_LIMIT){
        res.status(400).json({
            "error": "quota exhausted"
        });

        return;
    }

    if (!filename || filename == ""){
        res.status(400).json({
            "error": "Invalid filename"
        });

        return;
    }

    req.expiry = parseInt(req.headers['x-expiry']); //ms timestamp

    if (isNaN(req.expiry)){
        req.expiry = CONSTANTS.HOUR;
    } else {
        if (anon && req.expiry > CONSTANTS.DAY){
            res.status(400).json({
                "error": "Invalid expiry"
            });

            return;
        } else if (!anon && req.expiry > CONSTANTS.DAY){ //Rn both 1 day, later expand on this
            res.status(400).json({
                "error": "Invalid expiry"
            });

            return;
        }
    }

    //Check the quota used
    console.log(`[UPLOAD MIDDLEWARE] Performing quota check - original size is ${req.originalSize} and anon is ${anon}`);

    try {
        if (anon){
            let before = Date.now();
            let newUsed = await newAnonFile(req.originalSize);
            let after = Date.now();
            console.log(`[UPLOAD MIDDLEWARE] Quota check completed. New occupied size is ${newUsed}. Time: ${after - before} ms.`);
        } else {
            //Check the free balance instead
            let before = Date.now();
            let newUsed = await newFreeFile(req.originalSize);
            let after = Date.now();
            console.log(`[UPLOAD MIDDLEWARE] Quota check completed. New occupied size is ${newUsed}. Time: ${after - before} ms.`);
        }
    } catch (e){

        if (e.err == "NO_LOCK"){
            res.status(500).json({
                "error": "Unable to check free space"
            });
        } else if (e.err == "INVALID_SIZE"){
            res.status(500).json({
                "error": "Unable to check free space"
            });
        } else if (e.err == "NO_SPACE"){
            res.status(200).json({
                "error": "Server has no space left..."
            });
        }

        return;
    }

    // console.log(`Expiry is ${req.expiry}`);



    req.filename = filename;
    req.quota = QUOTA;
    next();
}