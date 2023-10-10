const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

const fetchUserIP = require("../fetchUserIP");

async function logoutAll(userName, token, id) {

    await connect2MongoDB();

    try {

        // Finding User Sessions By Id
        const findUserSession = await sessionsModel.findById(id);

        // If Session Is Null Means No Session Exist In DB, Then, Client Will Receive This Response
        if (findUserSession.length === null) {
            return {
                status: 400,
                message: "No Session Found.",
            };
        }

        // Decrypting User IP
        const userIPDecrypted = await decryptPassword(findUserSession.userIP);

        // Fetching User IP
        const userIP = await fetchUserIP();

        // If Current Session Exist In DB, Then, Delte All The Sessions Which Have The userName In It
        if (findUserSession.userName === userName && findUserSession.token === token && userIPDecrypted === userIP) {
            await sessionsModel.deleteMany({ userName: userName });
            return {
                status: 200,
                message: "All Of The User's Session Deleted.",
            };
        }

        // If Not Exist In DB, Then, Client Will Receive This Response
        return {
            status: 400,
            message: "Data Not Valid.",
        };

    } catch (error) {

        return {
            status: 400,
            message: "Data Not Valid.",
        };

    }

}

module.exports = logoutAll;