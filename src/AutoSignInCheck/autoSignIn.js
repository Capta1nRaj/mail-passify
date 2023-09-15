const { connect2MongoDB } = require("connect2mongodb");
const sessionsModel = require("../../models/sessionsModel");
const decryptPassword = require("../PasswordHashing/decryptPassword");
const fetchUserIP = require("../fetchUserIP");

require("dotenv").config();

async function autoSignIn(userName, token) {
    await connect2MongoDB();

    if (userName.length === 0 || token.length === 0) {
        return {
            status: 69,
            message: "Please provide both a username and a token.",
        };
    }

    const userIP = await fetchUserIP();

    const checkUserSessionExistOrNot = await sessionsModel.find({ userName });
    if (checkUserSessionExistOrNot.length === 0) {
        return {
            status: 204,
            message: "Session doesn't exist.",
        };
    }


    const sessionExists = await Promise.all(checkUserSessionExistOrNot.map(async (session) => {
        const userIPDecrypted = await decryptPassword(session.userIP);
        return (session.userVerified === true) && (session.token === token) && (userIP === userIPDecrypted);
    }));

    const result = sessionExists.some((value) => value === true);

    if (result) {
        return {
            status: 202,
            message: "Session exists.",
        };
    } else {
        return {
            status: 204,
            message: "Session doesn't exist.",
        };
    }
}

module.exports = autoSignIn;
