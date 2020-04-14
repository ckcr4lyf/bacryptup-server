const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const upload_middleware = require('./middlewares/upload_middleware');
const stream_file = require('./controllers/stream_file');
const get_file = require('./controllers/get_file');

const getLimit = rateLimit({
    windowMs: 60 * 1000, //1 minute
    max: 5,
    message: "Request files at a slower rate please."
});

router.post('/stream', upload_middleware, stream_file);
router.get('/file/:id', getLimit, get_file);
// router.get('/posts', get_posts);

module.exports = router;