require('dotenv').config()
const user = require('../db/user');
const { generateSecret, generateToken } = require('../helpers/access_token');

let newUser = {
    secret: generateSecret(),
    accessToken: generateToken(),
    accessLevel: 2,
    spaceUsed: 0
};

user.create(newUser, (err, doc) => {
    if (err){
        console.error("Failed to create user.");
    } else {
        console.log(`Created user!\nSecret: ${newUser.secret}\nAccess Token: ${newUser.accessToken}`);
    }
})