const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../../models/accountsModel");
const otpModel = require("../../models/otpModel");
const sessionsModel = require("../../models/sessionsModel");

const randomstring = require("randomstring");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signInOTPSend = require("./signInOTPSend");
const signUpOTPSend = require("../SignUP/signUpOTPSend");
const encryptPassword = require("../PasswordHashing/encryptPassword");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const fetchUserIP = require("../fetchUserIP");
const randomStringGenerator = require("../randomStringGenerator");

async function signin(userName, userPassword) {

    await connect2MongoDB();

    const username = userName;
    const password = userPassword;
    const userIP = await fetchUserIP();

    const findEmailIDToLogin = await accountsModel.findOne({ userName: username });

    if (findEmailIDToLogin.userVerified === false) {

        // Generating Random OTP
        const userOTP = await randomStringGenerator(6)

        // Securing OTP Via Crypto
        const encryptedOTP = await encryptPassword(userOTP);

        // If OTP Already Exist, Then, Replace It With New One
        const checkIfOTPExistOrNot = await otpModel.findOne({ userName: userName })

        if (checkIfOTPExistOrNot === null) {

            // Saving Details To DB
            new otpModel({
                userName: username,
                OTP: encryptedOTP
            }).save();

        } else if (checkIfOTPExistOrNot !== null) {
            const updateTheOTP = await otpModel.findOneAndUpdate({ userName: userName }, { OTP: encryptedOTP })
        }

        signUpOTPSend(username, findEmailIDToLogin.userEmail, userOTP)

        return {
            status: 200,
            message: "Please Verify Your Account",
            userName: username,
        }
    }

    if (findEmailIDToLogin === null) {
        return {
            status: 204,
            message: "Please Validate Your Details",
        };
    } else if (findEmailIDToLogin !== null) {
        // Decrypting The Password From The User
        const decryptedPassword = password === await decryptPassword(findEmailIDToLogin.userPassword);

        if (findEmailIDToLogin.userName === username && decryptedPassword === true) {
            // Generating Token Address
            const userTokenAddress = await randomStringGenerator(128);

            // Generating Random OTP
            const userOTP = await randomStringGenerator(6);

            // Securing User IP Via Crypto
            const encryptedUserIP = await encryptPassword(userIP);

            // Securing OTP Via Crypto
            const encryptedOTP = await encryptPassword(userOTP);

            // Saving Details To DB
            new sessionsModel({
                userName: username,
                token: userTokenAddress,
                userIP: encryptedUserIP,
                OTP: encryptedOTP,
            }).save();

            // Sending OTP To Mail
            await signInOTPSend(username, findEmailIDToLogin.userEmail, userOTP);

            return {
                status: 200,
                message: "Sign In Successful, OTP Sent To Mail",
                userName: username,
                token: userTokenAddress,
            };
        } else if (decryptedPassword === false) {
            return {
                status: 204,
                message: "Please Validate Your Details",
            };
        }
    }
}

module.exports = signin;