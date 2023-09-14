const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

const fetchUserIP = require("../fetchUserIP");

async function logoutAll(userName, token) {

    await connect2MongoDB();

    const userIP = await fetchUserIP();

    const findUserSession = await sessionsModel.find({ userName: userName });

    if (findUserSession.length === 0) {
        return {
            status: 204,
            message: "No Session Found.",
        };
    }

    const sessionExists = findUserSession.some((session) => {
        const decryptingUserIP = userIP === decryptPassword(session.userIP);
        return session.token === token && decryptingUserIP === true;
    });

    if (sessionExists) {
        await sessionsModel.deleteMany({ userName: userName });
        return {
            status: 200,
            message: "User All Sessions Deleted.",
        };
    }

    return {
        status: 204,
        message: "Data Not Valid.",
    };

}

module.exports = logoutAll;