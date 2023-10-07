const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../models/accountsModel");
const sessionsModel = require("../models/sessionsModel");
const otpModel = require("../models/otpModel");

const fs = require('fs');
const userConfig = JSON.parse(fs.readFileSync('mail-passify.json'));

const sendOTPToUser = require("./sendOTPToUser");
const fetchUserIP = require("./fetchUserIP");
const randomStringGenerator = require("./randomStringGenerator");
const encryptPassword = require("./PasswordHashing/encryptPassword");
const decryptPassword = require("./PasswordHashing/decryptPassword");

require("dotenv").config();

async function resendOTP(userName, functionPerformed, token, id) {

    await connect2MongoDB();

    // Generating userOTP Of Length 6
    const userOTP = await randomStringGenerator(6);

    // If New User Verification Needs To Be Done, Run This Function
    if (functionPerformed === 'newUserVerification') {

        // Checking If User Exist In DB Or Not
        const findIfUserNameExistBeforeSending = await otpModel.findOne({ userName });

        // If Not, Means Someone Is Trying To Uh....
        if (!findIfUserNameExistBeforeSending) {
            return {
                status: 401,
                message: "Is this Mr. Developer or someone trying to.... uh?",
            };
        }

        // If User Exist, Then, We Will Try To Check That How Many Times Did User Reguested For OTP
        // If It Reaches The Limit i.e. OTP_LIMITS in JSON file, Then, Tell User To Try After 10 Minutes
        if (findIfUserNameExistBeforeSending.OTPCount >= userConfig.OTP_LIMITS) {
            return {
                status: 400,
                message: "Max OTP Limit Reached, Please Try After 10 Minutes."
            };
        }

        // Encrypting The User OTP
        const encryptOTP = await encryptPassword(userOTP);

        // Updating User OTP Count And OTP
        await otpModel.findOneAndUpdate({ userName }, { OTP: encryptOTP, $inc: { OTPCount: 1 } });

        // Finding The User Email Via userName In The DB
        const findUserAndSendEmail = await accountsModel.findOne({ userName });

        // Sending OTP To User
        await sendOTPToUser(userName, findUserAndSendEmail?.userEmail, userOTP, 'signUp');

        return {
            status: 201,
            message: "OTP Resent To The User.",
        };

        // If Old User Verification Needs To Be Done, Then, Run This Function
    } else if (functionPerformed === 'oldUserVerification') {

        try {

            // Finding If User Session Exist In DB Or Not
            const findUserSessionViaID = await sessionsModel.findById(id)

            // If Not, Means Someone Is Trying To Uh....
            if (findUserSessionViaID === null) {
                return {
                    status: 401,
                    message: "Is this Mr. Developer or someone trying to.... uh?"
                }
            }

            // If It Reaches The Limit i.e. OTP_LIMITS in JSON file, Then, Tell User To Try After 10 Minutes
            if (findUserSessionViaID.OTPCount >= userConfig.OTP_LIMITS) {
                return {
                    status: 400,
                    message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                };
            }

            // Decrypting User IP
            const userIPDecrypted = await decryptPassword(findUserSessionViaID.userIP);

            // Fetching userIP
            const userIP = await fetchUserIP();

            if (findUserSessionViaID.userName === userName && findUserSessionViaID.token === token && userIP === userIPDecrypted) {

                // Generating userOTP Of Length 6
                const userOTP = await randomStringGenerator(6);

                // Ecnrytpiong The OTP
                const encryptOTP = await encryptPassword(userOTP);

                // Updating Secured OTP TO DB
                findUserSessionViaID.OTP = encryptOTP;

                // Incrementing OTP Count To DB
                findUserSessionViaID.OTPCount++;

                // Updating The DB With New Details
                await findUserSessionViaID.save();

                // Finding The Email Of The User
                const findUserAndSendEmail = await accountsModel.findOne({ userName });

                // Sending The OTP To The User
                await sendOTPToUser(userName, findUserAndSendEmail.userEmail, userOTP, 'signIn');

                return {
                    status: 201,
                    message: "OTP Resent To The User.",
                };

            } else {

                return {
                    status: 401,
                    message: "Is this Mr. Developer or someone trying to.... uh?",
                };

            }

        } catch (error) {

            return {
                status: 401,
                message: "Is this Mr. Developer or someone trying to.... uh?",
            };

        }

        // If User Needs To Reset The Password, Then, Run This Function
    } else if (functionPerformed === 'forgotPassword') {

        // Finding If User Exist In DB Or Not
        const findIfUserNameExistBeforeSending = await otpModel.findOne({ userName });

        // If Not, Means Someone Is Trying To Uh....
        if (findIfUserNameExistBeforeSending === null) {
            return {
                status: 401,
                message: "Is this Mr. Developer or someone trying to.... uh?",
            };
        }

        // If It Reaches The Limit i.e. OTP_LIMITS in JSON file, Then, Tell User To Try After 10 Minutes
        if (findIfUserNameExistBeforeSending.OTPCount >= userConfig.OTP_LIMITS) {

            return {
                status: 400,
                message: "Max OTP Limit Reached, Please Try After 10 Minutes."
            };

        }

        // Encrypting The OTP
        const encryptOTP = await encryptPassword(userOTP);

        // Updating Secured OTP TO DB
        findIfUserNameExistBeforeSending.OTP = encryptOTP;

        // Incrementing OTP Count To DB
        findIfUserNameExistBeforeSending.OTPCount++;

        // Updating The DB With New Details
        await findIfUserNameExistBeforeSending.save();

        // Finding userEmail Via userName
        const findUserAndSendEmail = await accountsModel.findOne({ userName });

        // Sending OTP To User
        await sendOTPToUser(userName, findUserAndSendEmail?.userEmail, userOTP, 'forgotPassword');

        return {
            status: 201,
            message: "OTP Resent To The User.",
        };

    }
}

module.exports = resendOTP;