const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../models/accountsModel");
const sessionsModel = require("../models/sessionsModel");
const otpModel = require("../models/otpModel");

const randomstring = require("randomstring");

require("dotenv").config();

const fs = require('fs');
let userConfiJSONData = fs.readFileSync('mail-passify.json');
let userConfig = JSON.parse(userConfiJSONData);

const signUpOTPSend = require("./SignUP/signUpOTPSend");
const signInOTPSend = require("./SignIn/signInOTPSend");

async function fetchUserIP() {
    const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then(
        (response) => response.json()
    );
    return fetchingUserIP.ip;
}

// User OTP Generation
const userOTP = randomstring.generate({
    length: 6,
    charset: ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"],
});

// Random Salt Generation
const randomSaltGenerator = Math.floor(Math.random() * 2) + 11;

const encryptPassword = require("./PasswordHashing/encryptPassword");
const decryptPassword = require("./PasswordHashing/decryptPassword");

async function resendOTP(userName, token) {

    await connect2MongoDB();

    if (token === undefined) {

        const findIfUserNameExistBeforeSending = await otpModel.findOne({ userName });

        if (findIfUserNameExistBeforeSending.OTPCount >= userConfig.OTP_LIMITS) {
            return {
                status: 204,
                message: "Max OTP Limit Reached, Please Try After 10 Minutes."
            }
        }

        if (!findIfUserNameExistBeforeSending) {
            return {
                status: 69,
                message: "Is this Mr. Developer or someone trying to... uh?",
            };
        } else if (findIfUserNameExistBeforeSending) {

            const encryptOTP = encryptPassword(userOTP)

            await otpModel.findOneAndUpdate({ userName }, { OTP: encryptOTP, OTPCount: findIfUserNameExistBeforeSending.OTPCount + 1 }, { new: true });

            const findUserAndSendEmail = await accountsModel.findOne({ userName });

            await signUpOTPSend(userName, findUserAndSendEmail.userEmail, userOTP);

            return {
                status: 201,
                message: "OTP Resent To The User.",
            };
        }

    } else if (token !== undefined) {

        const userIP = await fetchUserIP();

        const findIfUserSessionExistOrNot = await sessionsModel.find({ userName: userName });

        if (findIfUserSessionExistOrNot.length === 0) {
            return {
                status: 69,
                message: "Is this Mr. Developer or someone trying to... uh?",
            };
        } else if (findIfUserSessionExistOrNot.length !== 0) {

            let sessionIndex = -1;

            const sessionExists = findIfUserSessionExistOrNot.some((session, index) => {
                if (session.token === token && (userIP === decryptPassword(session.userIP))) {
                    sessionIndex = index;
                    return true; // To exit the loop once the condition is met.
                }
                return false;
            });

            if (sessionExists) {

                const encryptOTP = encryptPassword(userOTP);

                const sessionToUpdate = findIfUserSessionExistOrNot[sessionIndex];

                if (sessionToUpdate.OTPCount >= userConfig.OTP_LIMITS) {
                    return {
                        status: 204,
                        message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                    }
                }

                // Update the fields within the session object
                sessionToUpdate.OTP = encryptOTP;
                sessionToUpdate.OTPCount = sessionToUpdate.OTPCount + 1;

                // Save the updated session to MongoDB
                const updatedSession = await sessionToUpdate.save();

                const findUserAndSendEmail = await accountsModel.findOne({ userName: userName });

                await signInOTPSend(userName, findUserAndSendEmail.userEmail, userOTP);

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

}

module.exports = resendOTP;