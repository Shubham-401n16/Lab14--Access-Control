const Model = require('../models/model.js');
const userSchema = require('../models/user-schema.js');
const UsersModel = new Model(userSchema);

/**
 * A function that takes a base64 encoded string of the
 * format username:password, and returns an object with
 * those key-values in plaintext
 * @function
 * @param {string} encodedString - the base64 encoded username:password
 * @return {object} data - The decoded user data of the format {username, password}
 */
const base64Decoder = (encodedString) => {
    let data = {
        username: '',
        password: '',
    };

    let decodedString = Buffer.from(encodedString, 'base64').toString();
    let dataPieces = decodedString.split(':');

    data.username = dataPieces[0];
    data.password = dataPieces[1];

    return data;
};

/**
 * Takes in a username and password, and tries to find an
 * existing user that matches that content
 * @function
 * @param {object} userData - An object of the format {username, password}
 * @return {object} possibleUser - A user record from the DB
 * @return {object} userData - The unchanged params
 */
const getUserFromCredentials = async (userData) => {
    let possibleUsers = await UsersModel.readByQuery({
        username: userData.username,
    });

    for (let i = 0; i < possibleUsers.length; i++) {
        let isSame = possibleUsers[i].comparePasswords(userData.password);

        if (isSame) {
            return possibleUsers[i];
        }
    }
    return userData;
};

/**
 * Auth middleware that finds a user based on credentials
 * @function
 * @param {string} req.headers.authorization - a string with Basic or Bearer credentials
 * @return {object} req.user - The found user, or user credentials
 * @throws {Error} 401 - The user does not exist / some auth error
 */
const auth = async (req, res, next) => {
    // Splits the req.headers.authorization string into two pieces
    // Typically ["Basic", encoding] or ["Bearer", token]
    if (!req.headers.authorization) {
        next({ err: 401, msg: 'Missing auth headers' });
        return;
    }

    let authPieces = req.headers.authorization.split(' ');

    // Verify that two pieces were created from split
    // If not, the client messed up
    if (authPieces.length === 2) {
        // If the client is giving us Basic Auth
        if (authPieces[0] === 'Basic') {
            // Decode the data from gibberish to {username, password}
            let authData = base64Decoder(authPieces[1]);

            // Find a user from {username, password} in our DB
            req.user = await getUserFromCredentials(authData);

            // Move on to the next middleware/route handler
            next();

            // Return for safety (make sure no other code below is executed)
            return;
        }
        // If the client is giving us Bearer Auth
        else if (authPieces[0] === 'Bearer') {
            // Use JWT Verify (via UsersModel.verifyToken) to ensure
            // that the token is valid (not expired, tampered with, wrong)
            let tokenData = UsersModel.verifyToken(authPieces[1]);

            // tokenData should now be data encrypted in the token,
            // (in our case { _id } check that this is true
            // (otherwise perhaps tokenData is null/empty))
            if (tokenData && tokenData._id) {
                // Use the _id stored in tokenData to find the full
                // user record. Set this as req.user
                req.user = await UsersModel.read(tokenData._id);
            }

            // Move on to the next middleware/route handler
            next();

            // Return for safety (make sure no other code below is executed)
            return;
        }
    }

    // If we got here, something went wrong in the above code
    // Some of our if statements failed, meaning some auth stuff
    // is missing/incorrect
    next({ err: 401, msg: 'Missing correct authorization header' });
};

module.exports = auth;
