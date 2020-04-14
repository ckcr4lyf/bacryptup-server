const mongoose = require('./db');
let Schema = mongoose.Schema;

//Record of a single backup event
//accessToken (who), backupId (which of their "file"), uniqId (file doc)

let backup_schema = new Schema({
    user: String, //accessToken
    backupId: String, //user specified
    uniqId: String
});

backup_schema.virtual('file', {
    ref: 'File',
    localField: 'uniqId',
    foreignField: 'uniq_iq',
    justOne: true
});

module.exports = mongoose.model('Backup', backup_schema);