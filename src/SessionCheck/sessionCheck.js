const { connect2MongoDB } = require("connect2mongodb");
const sessionsModel = require("../../models/sessionsModel");
const decryptPassword = require("../PasswordHashing/decryptPassword");
const fetchUserIP = require("../fetchUserIP");

require("dotenv").config();

async function sessionCheck(userName, token, id) {

    try {

        // Checking If userName, Token, & id Is Passed By Client Or Not
        if (userName === undefined || token === undefined || id === undefined || userName.length === 0 || token.length === 0) {
            return {
                status: 204,
                message: "Please Provide Username, Token, & Id",
            };
        }

        await connect2MongoDB();

        // Find User Session Using ID
        const findSessionUsingUserID = await sessionsModel.findById(id)

        // If No Session Exist In DB, Client Will Receive This Response
        if (findSessionUsingUserID === null) {

            return {
                status: 400,
                message: "Session doesn't exist.",
            };

        }

        // Decrypting User IP
        const userIPDecrypted = await decryptPassword(findSessionUsingUserID.userIP);
        // Fetching User IP
        const userIP = await fetchUserIP();

        if (findSessionUsingUserID.userName === userName && findSessionUsingUserID.token === token && userIPDecrypted === userIP && findSessionUsingUserID.userVerified === true) {
            return {
                status: 202,
                message: "Session exists.",
                userName
            };

        } else {

            return {
                status: 400,
                message: "Session doesn't exist.",
            };

        }

    } catch (error) {

        return {
            status: 400,
            message: "Session doesn't exist.",
        };

    }
}

module.exports = sessionCheck;