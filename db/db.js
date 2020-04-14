const mongoose = require('mongoose');

const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const mongo_uri = `mongodb+srv://${user}:${password}@cluster0-kbw7e.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(mongo_uri);

mongoose.connection.on('connected', function(){
    console.log("Mongoose connection opened to " + mongo_uri);
});

mongoose.connection.on('error', function(err){
    console.log("Mongoose connection error: " + err);
});

mongoose.connection.on('disconnected', function(){
    console.log("Mongoose connection disconnected.");
});

module.exports = mongoose;