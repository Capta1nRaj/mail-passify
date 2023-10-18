import { connect2MongoDB } from "connect2mongodb";
import sessionsModel from "../../models/sessionsModel.mjs";
import decryptPassword from "../PasswordHashing/decryptPassword.mjs";
import fetchUserIP from "../fetchUserIP.mjs";

import { config } from 'dotenv';
config();

async function sessionCheck(username, token, id) {

    const userName = username.toLowerCase();

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

export default sessionCheck;