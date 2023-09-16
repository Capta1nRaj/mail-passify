const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../models/accountsModel")
const otpModel = require("../models/otpModel");
const sendOTPToUser = require("./sendOTPToUser");
const randomStringGenerator = require("./randomStringGenerator");
const encryptPassword = require("./PasswordHashing/encryptPassword");
const decryptPassword = require("./PasswordHashing/decryptPassword");

async function forgotPassword(userName, OTP, newPassword) {

    await connect2MongoDB()

    if (userName !== undefined && OTP === undefined && newPassword === undefined) {

        const finduserAndSendEmailForVerification = await accountsModel.findOne({ userName: userName });

        if (finduserAndSendEmailForVerification === null) {

            return {
                status: 204,
                message: "Username Doesn't Exist."
            }

        } else if (finduserAndSendEmailForVerification !== null) {

            // Generating Random OTP
            const userOTP = await randomStringGenerator(6);

            // Securing OTP Via Crypto
            const encryptedOTP = await encryptPassword(userOTP);


            await sendOTPToUser(finduserAndSendEmailForVerification.userName, finduserAndSendEmailForVerification.userEmail, userOTP, 'forgotPassword')

            const checkIfUserAlreadyRequestedForOTP = await otpModel.findOne({ userName: userName })

            if (checkIfUserAlreadyRequestedForOTP === null) {

                // Saving Details To DB
                new otpModel({
                    userName: userName,
                    OTP: encryptedOTP
                }).save();

                return {
                    status: 200,
                    message: "OTP Sent To Mail",
                    userName: userName,
                };

            } else if (checkIfUserAlreadyRequestedForOTP !== null) {

                const updateTheExistingModel = await otpModel.findOneAndUpdate({ userName: userName }, { OTP: encryptedOTP })

                return {
                    status: 200,
                    message: "OTP Sent To Mail",
                    userName: userName,
                };

            }

        }

    } else if (userName !== undefined && OTP !== undefined && newPassword !== undefined) {

        const finduserAndSendEmailForVerification = await otpModel.findOne({ userName: userName });

        // Decrypting The OTP From The User
        const decryptedOTP = (OTP === await decryptPassword(finduserAndSendEmailForVerification.OTP));

        if (decryptedOTP === false) {

            return {
                status: 204,
                message: "Wrong OTP"
            }

        } else if (decryptedOTP === true) {

            const encryptedPassword = await encryptPassword(newPassword)

            const findAndUpdatePassword = await accountsModel.findOneAndUpdate({ userName: userName }, { userPassword: encryptedPassword });

            return {
                status: 200,
                message: "Password Updated."
            }
        }
    }

}

module.exports = forgotPassword;