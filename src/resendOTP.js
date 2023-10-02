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

async function resendOTP(userName, functionPerformed, token) {

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
                status: 400,
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

        // Fetching userIP
        const userIP = await fetchUserIP();

        // Finding If User Session Exist In DB Or Not
        const findIfUserSessionExistOrNot = await sessionsModel.find({ userName });

        // If Not, Means Someone Is Trying To Uh....
        if (findIfUserSessionExistOrNot.length === 0) {
            return {
                status: 400,
                message: "Is this Mr. Developer or someone trying to.... uh?"
            }
        }

        // Here, We Will Find User Session Position, So We Are Setting Session Exist To False & Index To -1
        let sessionExists = false;
        let sessionIndex = -1;

        // Running A For Loop To Find User Session Position
        for (let index = 0; index < findIfUserSessionExistOrNot.length; index++) {

            // Getting Session Data By Values One By One
            const session = findIfUserSessionExistOrNot[index];

            // Decryptiong The IP
            const userIPDecrypted = await decryptPassword(session.userIP);

            // If userVerified Is False, Session Token Is Same, & userIP Is Same
            // Then, Check sessionExist To True, & sessionIndex To The Index Number
            if (!session.userVerified && session.token === token && userIP === userIPDecrypted) {
                sessionExists = true;
                sessionIndex = index;
                break;
            }

        }

        // When Session Exist Gets True, Then, The Function Will Continue From Here
        if (sessionExists) {

            // Ecnrytpiong The OTP
            const encryptOTP = await encryptPassword(userOTP);

            // Finding The Postion Of The Session
            const sessionToUpdate = findIfUserSessionExistOrNot[sessionIndex];

            // If It Reaches The Limit i.e. OTP_LIMITS in JSON file, Then, Tell User To Try After 10 Minutes
            if (sessionToUpdate.OTPCount >= userConfig.OTP_LIMITS) {
                return {
                    status: 400,
                    message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                };
            }

            // If Not, Then, Updating The OTP In The DB
            sessionToUpdate.OTP = encryptOTP;

            // Increasing The OTP Count On Each Request In The DB
            sessionToUpdate.OTPCount++;

            // Updating The Document To DB
            await sessionToUpdate.save();

            // Finding The Email Of The User
            const findUserAndSendEmail = await accountsModel.findOne({ userName });

            // Sending The OTP To The User
            await sendOTPToUser(userName, findUserAndSendEmail?.userEmail, userOTP, 'signIn');

            return {
                status: 201,
                message: "OTP Resent To The User.",
            };

        } else {

            return {
                status: 400,
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
                status: 400,
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

        // Updating The OTP Model
        await otpModel.findOneAndUpdate({ userName }, { OTP: encryptOTP, $inc: { OTPCount: 1 } });

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