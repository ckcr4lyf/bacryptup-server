const User = require('../../db/user');

module.exports = async (req, res, next) => {

    let filename = req.headers['filename'];
    let accessToken = req.headers['x-access-token'];

    if (!accessToken){
        res.status(401).send(">:(");
        return;
    }

    req.accessToken = accessToken;

    req.iv = req.headers['x-iv'];

    if (!req.iv){
        res.status(400).json({
            "error": "Missing IV"
        });
        return;
    }

    req.contentLength = parseInt(req.headers['content-length']);

    // if (!req.contentLength || isNaN(req.contentLength)){
    //     res.status(400).send(">:(");
    // }

    if (!isNaN(req.contentLength) && req.contentLength > (1024 * 1024 * 10)){
        res.status(413).json({
            "code": 7,
            "error": "Payload Too Large. Limit 10MB"
        });
    }

    let user = await User.findOne({
        accessToken: accessToken
    });

    if (!user){
        res.status(404).send(":o");
        return;
    }
    
    if (!isNaN(req.contentLength) && req.contentLength + user.spaceUsed > (1024 * 1024 * 150)){
        //150MB limit for now
        res.status(403).json({
            "error": "You've used up too much space. Delete files then try"
        });
    }

    req.user = user;

    if (!filename || filename == ""){
        res.status(400).json({
            "error": "Invalid filename"
        });

        return;
    }

    req.filename = filename;
    req.key = req.headers['x-encrypted-key'];

    if (req.key && user.accessLevel == 1){
        //They are not allowed to use public key shit
        res.status(401).json({
            "error": "Encrypted key not accepted"
        });

        return;
    }

    req.backupId = req.headers['x-backup-id']; // If needed

    // console.log("Middleware log:", req.filename, req.key, req.iv);
    next();
}