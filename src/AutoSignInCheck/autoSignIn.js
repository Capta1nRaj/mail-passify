const { connect2MongoDB } = require("connect2mongodb");
const sessionsModel = require("../../models/sessionsModel");
const decryptPassword = require("../PasswordHashing/decryptPassword");

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

    const sessionExists = checkUserSessionExistOrNot.some(
        (session) =>
            session.token === token &&
            session.userVerified === true &&
            userIP === decryptPassword(session.userIP)
    );

    if (sessionExists) {
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

async function fetchUserIP() {
    const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then(
        (response) => response.json()
    );
    return fetchingUserIP.ip;
}

module.exports = autoSignIn;
