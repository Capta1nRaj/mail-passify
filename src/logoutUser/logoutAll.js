const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

const fetchUserIP = require("../fetchUserIP");

async function logoutAll(userName, token) {

    await connect2MongoDB();

    // Fetching User IP
    const userIP = await fetchUserIP();

    // Finding All User Sessions
    const findUserSession = await sessionsModel.find({ userName: userName });

    // If Session Length Is 0 Means No Session Will The Provided userName Exist In DB, Then, Client Will Receive This Response
    if (findUserSession.length === 0) {
        return {
            status: 400,
            message: "No Session Found.",
        };
    }

    // It Will Find If The Current Session Exist In DB Or Not
    const sessionExists = findUserSession.some(async (session) => {
        const decryptingUserIP = userIP === await decryptPassword(session.userIP);
        return session.token === token && decryptingUserIP === true;
    });

    // If Current Session Exist In DB, Then, Delte All The Sessions Which Have The userName In It
    if (sessionExists) {
        await sessionsModel.deleteMany({ userName: userName });
        return {
            status: 200,
            message: "User All Sessions Deleted.",
        };
    }

    // If Not Exist In DB, Then, Client Will Receive This Response
    return {
        status: 400,
        message: "Data Not Valid.",
    };

}

module.exports = logoutAll;