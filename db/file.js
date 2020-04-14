const mongoose = require('./db');
let Schema = mongoose.Schema;

let file_schema = new Schema({
    original_name: String,
    s3_path: String,
    key: String, //Encrypted key in base64. Optional. Only for paid users
    iv: String, //IV in base64
    uniq_id: String, //Will generate this. For app.com/file/id
    etag: String,
    size: Number,
    user: String
});

module.exports = mongoose.model('File', file_schema);