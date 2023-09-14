const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../../models/accountsModel");
const otpModel = require("../../models/otpModel");

const randomstring = require("randomstring");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signUpOTPSend = require("./signUpOTPSend");
const encryptPassword = require("../PasswordHashing/encryptPassword");
const randomStringGenerator = require("../randomStringGenerator");

async function signup(userFullName, userName, userEmail, userPassword, userReferredBy) {

    await connect2MongoDB();

    // Getting Data From The Client
    const fullname = userFullName;
    const username = userName;
    const email = userEmail;
    const password = userPassword;
    var referredby = userReferredBy;

    // Checking If UserName Already Exists In DB Or Not
    const findIfUserNameAlreadyExistInDBOrNot = await accountsModel.findOne({ userName: username });

    // Checking If EmailId Already Exists In DB Or Not
    const findIfEmailIDAlreadyExistInDBOrNot = await accountsModel.findOne({ userEmail: email });

    // Checking If userReferralCode Exist In DB Or Not
    if (userReferredBy.length === 0) {
        referredby = "";
    } else if (userReferredBy.length !== 0) {
        var checkIfuserReferralCodeExistInDBOrNot = await accountsModel.findOne({ userReferralCode: referredby });
    }

    if (findIfUserNameAlreadyExistInDBOrNot !== null) {
        return {
            status: 200,
            message: "User Name Already Exists",
        };
    } else if (findIfEmailIDAlreadyExistInDBOrNot !== null) {
        return {
            status: 200,
            message: "Email ID Already Exists",
        };
    } else if (checkIfuserReferralCodeExistInDBOrNot === null) {
        return {
            status: 200,
            message: "Wrong Referral Code",
        };
    } else if (findIfUserNameAlreadyExistInDBOrNot === null && findIfEmailIDAlreadyExistInDBOrNot === null && checkIfuserReferralCodeExistInDBOrNot !== null) {
        // User Unique Referral Code
        const userReferralCode = await generatingUserReferralCode();

        if (checkIfuserReferralCodeExistInDBOrNot === undefined) {
            referredby = "";
        }

        // Securing Password Via Crypto
        const encryptedPassword = encryptPassword(password);

        // Saving Details To DB
        new accountsModel({
            userFullName: fullname,
            userName: username,
            userEmail: userEmail,
            userPassword: encryptedPassword,
            userReferralCode: userReferralCode,
            userReferredBy: referredby,
        }).save();

        // Generating Random OTP
        const userOTP = randomStringGenerator(6);
        // Securing OTP Via Crypto
        const encryptedOTP = encryptPassword(userOTP);

        // Sending OTP To User
        await signUpOTPSend(username, userEmail, userOTP)

        // Saving Details To DB
        new otpModel({
            userName: userName,
            OTP: encryptedOTP
        }).save();

        return {
            status: 201,
            message: "Account Created Successfully",
            userName: username,
        };
    }

    // Generating A Unique Referral Code For User & Checking That If It's Exist In DB Or Not
    // Once It Get's An Unique UserReferralCode, It Will Save The User Referral Code To DB
    async function generatingUserReferralCode() {
        const userReferralCode = randomStringGenerator(6);

        // Checking If UserReferralCode Exist In DB Or Not
        const checkIfuserReferralCodeExistInDBOrNot = await accountsModel.findOne({ userReferralCode: userReferralCode });

        // If Code Exist In DB, Then, Rerun The Function Else Retrun The Code.
        if (checkIfuserReferralCodeExistInDBOrNot !== null) {
            await generatingUserReferralCode();
        } else if (checkIfuserReferralCodeExistInDBOrNot === null) {
            return userReferralCode;
        }
    }
}

module.exports = signup;