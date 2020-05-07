const quota = require('../../helpers/quota');
const constants = require('../../constants');

/** @type RequestHandler */
module.exports = async (req, res) => {
    try {
        const result = await Promise.all([quota.getAnonQuota(), quota.getFreeQuota()]);
        // console.log(result);

        let data = {
            anonAvail: constants.ANON_S3_LIMIT - result[0],
            userAvail: constants.USER_S3_LIMIT - result[1]
        };

        res.json(data);
    } catch (e) {
        res.status(500).json(e);
    }
}