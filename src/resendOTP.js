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

async function resendOTP(userName, token) {
    await connect2MongoDB();
    const userOTP = await randomStringGenerator(6);

    if (token === undefined) {
        const findIfUserNameExistBeforeSending = await otpModel.findOne({ userName });

        if (findIfUserNameExistBeforeSending?.OTPCount >= userConfig.OTP_LIMITS) {
            return {
                status: 204,
                message: "Max OTP Limit Reached, Please Try After 10 Minutes."
            };
        }

        if (!findIfUserNameExistBeforeSending) {
            return {
                status: 69,
                message: "Is this Mr. Developer or someone trying to... uh?",
            };
        }

        const encryptOTP = await encryptPassword(userOTP);

        await otpModel.findOneAndUpdate({ userName }, { OTP: encryptOTP, $inc: { OTPCount: 1 } });

        const findUserAndSendEmail = await accountsModel.findOne({ userName });

        await sendOTPToUser(userName, findUserAndSendEmail?.userEmail, userOTP, 'signUp');

        return {
            status: 201,
            message: "OTP Resent To The User.",
        };
    } else if (token !== undefined) {
        const userIP = await fetchUserIP();
        const findIfUserSessionExistOrNot = await sessionsModel.find({ userName });

        if (findIfUserSessionExistOrNot.length === 0) {
            return {
                status: 69,
                message: "Is this Mr. Developer or someone trying to... uh?",
            };
        }

        let sessionExists = false;
        let sessionIndex = -1;

        for (let index = 0; index < findIfUserSessionExistOrNot.length; index++) {
            const session = findIfUserSessionExistOrNot[index];
            const userIPDecrypted = await decryptPassword(session.userIP);
            if (!session.userVerified && session.token === token && userIP === userIPDecrypted) {
                sessionExists = true;
                sessionIndex = index;
                break;
            }
        }

        if (sessionExists) {
            const encryptOTP = await encryptPassword(userOTP);
            const sessionToUpdate = findIfUserSessionExistOrNot[sessionIndex];

            if (sessionToUpdate?.OTPCount >= userConfig.OTP_LIMITS) {
                return {
                    status: 204,
                    message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                };
            }

            sessionToUpdate.OTP = encryptOTP;
            sessionToUpdate.OTPCount++;

            await sessionToUpdate.save();

            const findUserAndSendEmail = await accountsModel.findOne({ userName });
            await sendOTPToUser(userName, findUserAndSendEmail?.userEmail, userOTP, 'signIn');

            return {
                status: 201,
                message: "OTP Resent To The User.",
            };
        } else {
            return {
                status: 69,
                message: "Is this Mr. Developer or someone trying to... uh?",
            };
        }
    }
}

module.exports = resendOTP;