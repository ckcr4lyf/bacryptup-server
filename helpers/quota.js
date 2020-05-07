const fs = require('fs');

const getAnonQuota = () => {
    return new Promise ( (resolve, reject) => {
        console.log(`[QUOTA] Checking anon quota...`);
        if (!fs.existsSync("anon.lock")){
            reject({
                "err": "NO_LOCK"
            });

            return;
        }

        let anonSize = parseInt(fs.readFileSync("anon.lock"));

        if (isNaN(anonSize)){
            reject({
                "err": "INVALID_SIZE"
            });
            return;
        } else {
            resolve(anonSize);
            console.log(`[QUOTA] Finished check for anon quota.`);
        }
    });
}

const getFreeQuota = () => {
    return new Promise ( (resolve, reject) => {
        console.log(`[QUOTA] Checking free user quota...`);
        if (!fs.existsSync("free.lock")){
            reject({
                "err": "NO_LOCK"
            });

            return;
        }

        let freeSize = parseInt(fs.readFileSync("free.lock"));

        if (isNaN(freeSize)){
            reject({
                "err": "INVALID_SIZE"
            });
            return;
        } else {
            resolve(freeSize);
            console.log(`[QUOTA] Finished check for free user quota.`);
        }
    });
}

module.exports = {
    getAnonQuota: getAnonQuota,
    getFreeQuota: getFreeQuota
};