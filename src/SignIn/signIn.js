const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../../models/accountsModel");
const otpModel = require("../../models/otpModel");
const sessionsModel = require("../../models/sessionsModel");
const sgMail = require("@sendgrid/mail");
const encryptPassword = require("../PasswordHashing/encryptPassword");
const decryptPassword = require("../PasswordHashing/decryptPassword");
const fetchUserIP = require("../fetchUserIP");
const randomStringGenerator = require("../randomStringGenerator");
const sendOTPToUser = require("../sendOTPToUser");
const fs = require('fs');
const userConfig = JSON.parse(fs.readFileSync('mail-passify.json'));

require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function signin(userName, userPassword) {

    await connect2MongoDB();

    // Finding If User Exist Or Not Fron userName
    const findEmailIDToLogin = await accountsModel.findOne({ userName });

    // If userName Don't Exist, Return A Bad Request
    if (!findEmailIDToLogin) {
        return {
            status: 400,
            message: "Please Validate Your Details",
        };
    }

    // If User Is Not Verified, Redirect User To SignUp Page, & Ask Them To Verify First
    if (!findEmailIDToLogin.userVerified) {

        // Generating OTP
        const userOTP = await randomStringGenerator(6);

        // Encrypting OTP
        const encryptedOTP = await encryptPassword(userOTP);

        // Checking If OTP Already Exist In DB Or Not
        const checkIfOTPExistOrNot = await otpModel.findOne({ userName });

        // If OTP Not Exist, Then, Create A New Doc & Save To DB
        if (!checkIfOTPExistOrNot) {

            new otpModel({
                userName,
                OTP: encryptedOTP,
            }).save();

            // If OTP Exist, Then, Find & Update The Doc & Save To DB
        } else {

            // Check If OTP Limit Is Exceeded Or Not
            // If Exceeded Then Don't Generate More OTP
            if (checkIfOTPExistOrNot.OTPCount >= userConfig.OTP_LIMITS) {
                return {
                    status: 403,
                    message: "Max OTP Limit Reached, Please Try After 10 Minutes."
                };
            }

            // If Not Exceeded Then Generate New OTP & Increase OTPCount By 1
            await otpModel.findOneAndUpdate({ userName }, { $inc: { OTPCount: 1 }, OTP: encryptedOTP }, { new: true });

        }

        // Sending OTP To User Registered E-Mail
        await sendOTPToUser(userName, findEmailIDToLogin.userEmail, userOTP, 'signUp');

        return {
            status: 200,
            message: "Please Verify Your Account",
            userName,
        };
    }

    // If User Is Verified, Then, Decrypt The User Password
    const decryptedPassword = userPassword === await decryptPassword(findEmailIDToLogin.userPassword);

    // Fetching User IP
    const userIP = await fetchUserIP();

    // Checking If userName & userPassword Are The Same As Per The Client Entered
    if (findEmailIDToLogin.userName === userName && decryptedPassword) {

        // Generating Token Address Of 128 Length
        const userTokenAddress = await randomStringGenerator(128);

        // Generating OTP
        const userOTP = await randomStringGenerator(6);

        // Encryptiong User IP
        const encryptedUserIP = await encryptPassword(userIP);

        // Encrypting User OTP
        const encryptedOTP = await encryptPassword(userOTP);

        // Saving Session To DB
        const savedData = await new sessionsModel({
            userName,
            token: userTokenAddress,
            userIP: encryptedUserIP,
            OTP: encryptedOTP,
        }).save();

        // Sending OTP To User Registered E-Mail
        await sendOTPToUser(userName, findEmailIDToLogin.userEmail, userOTP, 'signIn');

        return {
            status: 201,
            message: "Sign In Successful, OTP Sent To Mail",
            userName,
            token: userTokenAddress,
            id: savedData.id
        };

    } else {

        return {
            status: 400,
            message: "Please Validate Your Details",
        };

    }
}

module.exports = signin;
