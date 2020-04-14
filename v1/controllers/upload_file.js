const file = require('../../db/file');
const { uploadFile } = require('../../helpers/s3_helper');


// POST /v1/file

module.exports = (req, res) => {

    const body = req.body;

    if (req.file){
        console.log(req.file);
        uploadFile(req.file.path, req.file.filename, body.encryptionKey, body.iv, res);
    } else {
        res.status(400).json({
            "error": "file missing"
        });
    }
}