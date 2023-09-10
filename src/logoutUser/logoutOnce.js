const { connect2MongoDB } = require("connect2mongodb");

const sessionsModel = require("../../models/sessionsModel");

const bcrypt = require("bcrypt");

async function logoutOnce(userName, token) {

    await connect2MongoDB();

    const userIP = await getIPFromUser();

    const findUserSession = await sessionsModel.find({ userName: userName });

    if (findUserSession.length === 0) {
        return {
            status: 204,
            message: "No Session Found.",
        };
    }

    const sessionExists = findUserSession.some((session) => {
        const decryptingUserIP = bcrypt.compareSync(userIP, session.userIP);
        return session.token === token && decryptingUserIP === true;
    });

    if (sessionExists) {
        await sessionsModel.deleteMany({ userName: userName, token: { $eq: token } });
        return {
            status: 200,
            message: "User Session Deleted.",
        };
    }

    return {
        status: 204,
        message: "Data Not Valid.",
    };
}

async function getIPFromUser() {
    const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then((response) =>
        response.json()
    );
    return fetchingUserIP.ip;
}

module.exports = logoutOnce;