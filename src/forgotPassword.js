const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../models/accountsModel")
const otpModel = require("../models/otpModel");
const sendOTPToUser = require("./sendOTPToUser");
const randomStringGenerator = require("./randomStringGenerator");
const encryptPassword = require("./PasswordHashing/encryptPassword");
const decryptPassword = require("./PasswordHashing/decryptPassword");
const fs = require('fs');
const userConfig = JSON.parse(fs.readFileSync('mail-passify.json'));

async function forgotPassword(userName, OTP, newPassword) {

    try {

        if (userName.length === 0) {

            return {
                status: 401,
                message: "Is this Mr. Developer or someone trying to.... uh?",
            };

        }

        // Using This Case, We Are Generating OTP For User To Authenticate
        if (userName !== undefined && OTP === undefined && newPassword === undefined) {

            await connect2MongoDB();

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

                // Checking If OTP Already Exist In DB Or Not
                const checkIfUserAlreadyRequestedForOTP = await otpModel.findOne({ userName: userName })

                // If Not, Then, Save The OTP In DB
                if (checkIfUserAlreadyRequestedForOTP === null) {

                    // Generating Random OTP
                    const userOTP = await randomStringGenerator(6);

                    // Securing OTP Via Crypto
                    const encryptedOTP = await encryptPassword(userOTP);

                    // Sending OTP To The User
                    await sendOTPToUser(finduserAndSendEmailForVerification.userName, finduserAndSendEmailForVerification.userEmail, userOTP, 'forgotPassword')

                    // Saving Details To DB
                    new otpModel({
                        userName: userName,
                        OTP: encryptedOTP
                    }).save();

                    return {
                        status: 201,
                        message: "OTP Sent To Mail",
                        userName: userName,
                    };

                    // If OTP Exist, Then, Update The Docuement In The DB
                } else if (checkIfUserAlreadyRequestedForOTP !== null) {

                    // If It Reaches The Limit i.e. OTP_LIMITS in JSON file, Then, Tell User To Try After 10 Minutes
                    if (checkIfUserAlreadyRequestedForOTP.OTPCount >= userConfig.OTP_LIMITS) {
                        return {
                            status: 403,
                            message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                        };
                    }

                    // Generating Random OTP
                    const userOTP = await randomStringGenerator(6);

                    // Securing OTP Via Crypto
                    const encryptedOTP = await encryptPassword(userOTP);

                    // Sending OTP To The User
                    await sendOTPToUser(finduserAndSendEmailForVerification.userName, finduserAndSendEmailForVerification.userEmail, userOTP, 'forgotPassword')

                    // Updating The Document With New OTP Value
                    checkIfUserAlreadyRequestedForOTP.OTP = encryptedOTP;

                    // Incrementing OTP Count To DB
                    checkIfUserAlreadyRequestedForOTP.OTPCount++;

                    // Updating The DB With New Details
                    await checkIfUserAlreadyRequestedForOTP.save();

                    return {
                        status: 201,
                        message: "OTP Sent To Mail",
                        userName: userName,
                    };

                }
            }

            // When User Enters OTP, & New Password, Then,
            // First We Will Validate The OTP, Then, If OTP Corrent We Update The Password, Else We Throw Error As Response To The Client
        } else if (userName !== undefined && OTP !== undefined && newPassword !== undefined) {

            // If User Enters OTP With Length Greater Than 6, Throw An Error
            if (OTP.length > 6) {
                return {
                    status: 400,
                    message: "Wrong OTP",
                };
            }

            await connect2MongoDB();

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

                const deleteTheOTPModel = await otpModel.findOneAndDelete({ userName })

                return {
                    status: 200,
                    message: "Password Updated."
                }
            }
        }

    } catch (error) {

        return {
            status: 401,
            message: "Is this Mr. Developer or someone trying to.... uh?",
        };

    }

}

module.exports = forgotPassword;