const crypto = require('crypto');

const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

const generateSecret = () => {
    return (crypto.randomBytes(20).toString('hex') + '-' + crypto.randomBytes(20).toString('hex'));
}

module.exports = {
    generateToken: generateToken,
    generateSecret: generateSecret
}