const post = require('../../db/post');

module.exports = (req, res) => {

    const body = req.body;
    let edits = {};

    if (!body.postId){
        res.status(400).json({
            "error": "Missing Post ID"
        });
    }

    const postId = body.postId;

    if (body.title) {
        edits.title = body.title;
    }

    if (body.content) {
        edits.content = body.content;
    }

    if (edits = {}) {
        res.status(400).json({
            "error": "Missing Parameters"
        });
    }

    post.updateOne(
        {
            "_id": postId
        },
        {
            "$set": edits
        },
        (err, post) => {
            if (err) {
                res.json(err)
            } else {
                res.status(200).json(post);
            }
        }
    );
}