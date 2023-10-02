const { connect2MongoDB } = require("connect2mongodb");
const sessionsModel = require("../../models/sessionsModel");
const decryptPassword = require("../PasswordHashing/decryptPassword");
const fetchUserIP = require("../fetchUserIP");

require("dotenv").config();

async function autoSignIn(userName, token) {

    await connect2MongoDB();

    // Checking If userName & Token Is Passed By Client Or Not
    if (userName === undefined || token === undefined || userName.length === 0 || token.length === 0) {
        return {
            status: 400,
            message: "Please Provide Both A Username And A Token.",
        };
    }

    // Fetching User IP
    const userIP = await fetchUserIP();

    // Finding The User Session In The DB
    const session = await sessionsModel.findOne({
        userName,
        userVerified: true,
        token,
    });

    // If Session Exists, Compare The IP
    if (session) {
        const userIPDecrypted = await decryptPassword(session.userIP);
        if (userIP === userIPDecrypted) {
            return {
                status: 202,
                message: "Session exists.",
            };
        }
    }

    // If IP Compare Fails, Then, Redirect To Homepage
    return {
        status: 400,
        message: "Session doesn't exist.",
    };
}

module.exports = autoSignIn;