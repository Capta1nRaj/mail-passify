const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../models/accountsModel")
const otpModel = require("../models/otpModel");
const sendOTPToUser = require("./sendOTPToUser");
const randomStringGenerator = require("./randomStringGenerator");
const encryptPassword = require("./PasswordHashing/encryptPassword");
const decryptPassword = require("./PasswordHashing/decryptPassword");

async function forgotPassword(userName, OTP, newPassword) {

    await connect2MongoDB()

    // Using This Case, We Are Generating OTP For User To Authenticate
    if (userName !== undefined && OTP === undefined && newPassword === undefined) {

        // First We Find If User Exist Or Not
        const finduserAndSendEmailForVerification = await accountsModel.findOne({ userName: userName });

        // If Not, Client Will Receive This Response
        if (finduserAndSendEmailForVerification === null) {

            return {
                status: 400,
                message: "Username Doesn't Exist."
            }

            // If Exist, OTP Will Be Generated
        } else if (finduserAndSendEmailForVerification !== null) {

            // Generating Random OTP
            const userOTP = await randomStringGenerator(6);

            // Securing OTP Via Crypto
            const encryptedOTP = await encryptPassword(userOTP);

            // Sending OTP To The User
            await sendOTPToUser(finduserAndSendEmailForVerification.userName, finduserAndSendEmailForVerification.userEmail, userOTP, 'forgotPassword')

            // Checking If OTP Already Exist In DB Or Not
            const checkIfUserAlreadyRequestedForOTP = await otpModel.findOne({ userName: userName })

            // If Not, Then, Save The OTP In DB
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

                // If OTP Exist, Then, Update The Docuement In The DB
            } else if (checkIfUserAlreadyRequestedForOTP !== null) {

                const updateTheExistingModel = await otpModel.findOneAndUpdate({ userName: userName }, { OTP: encryptedOTP }, { new: true })

                return {
                    status: 200,
                    message: "OTP Sent To Mail",
                    userName: userName,
                };

            }

        }

        // When User Enters OTP, & New Password, Then,
        // First We Will Validate The OTP, Then, If OTP Corrent We Update The Password, Else We Throw Error As Response To The Client
    } else if (userName !== undefined && OTP !== undefined && newPassword !== undefined) {

        // Find The OTP In The DB To Verify
        const finduserAndSendEmailForVerification = await otpModel.findOne({ userName: userName });

        // Decrypting The OTP From The User
        const decryptedOTP = (OTP === await decryptPassword(finduserAndSendEmailForVerification.OTP));

        // If OTP Is False, Client Will Recevie This Response
        if (decryptedOTP === false) {

            return {
                status: 400,
                message: "Wrong OTP"
            }

            // If OTP Is True, Then, Find & Update The Password Of The Client
        } else if (decryptedOTP === true) {

            const encryptedPassword = await encryptPassword(newPassword)

            const findAndUpdatePassword = await accountsModel.findOneAndUpdate({ userName: userName }, { userPassword: encryptedPassword }, { new: true });

            return {
                status: 200,
                message: "Password Updated."
            }
        }
    }

}

module.exports = forgotPassword;