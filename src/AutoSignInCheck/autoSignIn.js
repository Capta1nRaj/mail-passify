const { connect2MongoDB } = require("connect2mongodb");
const sessionsModel = require("../../models/sessionsModel");
const decryptPassword = require("../PasswordHashing/decryptPassword");
const fetchUserIP = require("../fetchUserIP");

require("dotenv").config();

async function autoSignIn(userName, token) {
    await connect2MongoDB();

    if (userName === undefined || token === undefined || userName.length === 0 || token.length === 0) {
        return {
            status: 69,
            message: "Please provide both a username and a token.",
        };
    }

    const userIP = await fetchUserIP();

    const session = await sessionsModel.findOne({
        userName,
        userVerified: true,
        token,
    });

    if (session) {
        const userIPDecrypted = await decryptPassword(session.userIP);
        if (userIP === userIPDecrypted) {
            return {
                status: 202,
                message: "Session exists.",
            };
        }
    }

    return {
        status: 400,
        message: "Session doesn't exist.",
    };
}

module.exports = autoSignIn;