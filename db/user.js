const mongoose = require('./db');
let Schema = mongoose.Schema;

let user_schema = new Schema({
    secret: String, //Used if they ever want a new token
    accessToken: String, //Used for authenticatinh requests
    accessLevel: Number, //0 - admin, 1 - normal, 2 - paid,
    spaceUsed: Number
});


module.exports = mongoose.model('User', user_schema);