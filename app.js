require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
const cleaner = require('./helpers/cleaner');

require('./helpers/size_lock');

var api_v1 = require('./v1/api_route');

var app = express();
app.use(cors());
app.locals.asize = 0;
var http = require('http').Server(app);

//require('./db/initialize');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/v1', api_v1);

http.listen(3000, '127.0.0.1', function(){
    console.log("Server started on port 3000");
});

cleaner();

setInterval(cleaner, 1800000); //Every 30 mins