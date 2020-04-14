const post = require('../../db/post');

module.exports = (req, res) => {

    post.find().limit(10).sort({
        "_id": -1
    }).exec((err, posts) => {
        if (err){
            res.json(err);
        } else {
            res.json(posts);
        }
    });
}