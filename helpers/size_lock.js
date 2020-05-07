const fs = require('fs');

if (!fs.existsSync("anon.lock")){
    fs.writeFileSync("anon.lock", "0");
}

if (!fs.existsSync("free.lock")){
    fs.writeFileSync("free.lock", "0");
}

//These calls are synchronous. So its ok for the hacky "locks"

const newAnonFile = (originalSize) => {

    //We read anon.lock into a int
    //Check if adding originalSize will break our limit
    //If so, reject
    //Else update & resolve

    //Entire call is synchronous, so ideally no race conditions
    return new Promise( (resolve, reject) => {

        // const id = Math.random();

        // console.log(`${id} - In the quota check for anon...`)
        if (!fs.existsSync("anon.lock")){
            reject({
                "err": "NO_LOCK"
            });
            return;
        } 

        //Get the size from file
        let anonSize = parseInt(fs.readFileSync("anon.lock"));

        if (isNaN(anonSize)){
            reject({
                "err": "INVALID_SIZE"
            });
            return;
        }

        // console.log(`${id} - Current used size is ${anonSize}`);

        if (anonSize + originalSize > 1024 * 1024 * 1024 * 2){ //2GB hardcoded for now
            // console.log(`${id} - Ran out of allocated free space...`)
            reject({
                "err": "NO_SPACE"
            });
            return;
        }
        
        let newSize = anonSize + originalSize;
        // console.log(`${id} - New used size is ${newSize}`);

        fs.writeFileSync("anon.lock", newSize.toString()); //Store the new value
        resolve(newSize);

        console.log(`[SIZE LOCK] Added ${originalSize} bytes to anon space.`);
    });
}

const newFreeFile = (originalSize) => {

    //Same as anon but different file

    return new Promise( (resolve, reject) => {

        if (!fs.existsSync("free.lock")){
            reject({
                "err": "NO_LOCK"
            });
            return;
        } 

        //Get the size from file
        let anonSize = parseInt(fs.readFileSync("free.lock"));

        if (isNaN(anonSize)){
            reject({
                "err": "INVALID_SIZE"
            });
            return;
        }

        if (anonSize + originalSize > 1024 * 1024 * 1024 * 20){ //20GB hardcoded for now
            reject({
                "err": "NO_SPACE"
            });
            return;
        }
        
        let newSize = anonSize + originalSize;

        fs.writeFileSync("free.lock", newSize.toString()); //Store the new value
        resolve(newSize);

        console.log(`[SIZE LOCK] Added ${originalSize} bytes to user space.`);
    });
}

const freeAnonSpace = (bytes) => {

    const FILENAME = "anon.lock";
    
    return new Promise ( (resolve, reject) => {

        if (!fs.existsSync(FILENAME)){
            reject({
                "err": "NO_LOCK"
            });

            return;
        }

        let anonSize = parseInt(fs.readFileSync(FILENAME));

        if (isNaN(anonSize)){
            reject({
                "err": "INVLAID_SIZE"
            });

            return;
        }

        let newSize = anonSize - bytes;

        if (newSize < 0){
            newSize = 0; //WTF? but ok
        }

        fs.writeFileSync(FILENAME, newSize.toString());
        resolve(newSize);

        console.log(`[SIZE LOCK] Freed ${bytes} bytes of anon space.`);
    });
}

const freeUserSpace = (bytes) => {

    const FILENAME = "free.lock";
    
    return new Promise ( (resolve, reject) => {

        if (!fs.existsSync(FILENAME)){
            reject({
                "err": "NO_LOCK"
            });

            return;
        }

        let userSize = parseInt(fs.readFileSync(FILENAME));

        if (isNaN(userSize)){
            reject({
                "err": "INVLAID_SIZE"
            });

            return;
        }

        let newSize = userSize - bytes;

        if (newSize < 0){
            newSize = 0; //WTF? but ok
        }

        fs.writeFileSync(FILENAME, newSize.toString());
        resolve(newSize);

        console.log(`[SIZE LOCK] Freed ${bytes} bytes of user space.`);
    });
}

module.exports = {
    newFreeFile: newFreeFile,
    newAnonFile: newAnonFile,
    freeAnonSpace: freeAnonSpace,
    freeUserSpace: freeUserSpace
};