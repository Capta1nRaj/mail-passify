const { connect2MongoDB } = require("connect2mongodb");
const accountsModel = require("../../models/accountsModel");
const otpModel = require("../../models/otpModel");
const sgMail = require("@sendgrid/mail");
const encryptPassword = require("../PasswordHashing/encryptPassword");
const randomStringGenerator = require("../randomStringGenerator");
const sendOTPToUser = require("../sendOTPToUser");

require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function signup(userFullName, userName, userEmail, userPassword, userReferredBy) {

    await connect2MongoDB();

    try {

        // Checking If UserName & EmailId Already Exists In DB Or Not
        const existingUser = await accountsModel.findOne({ $or: [{ userName }, { userEmail }] });

        // If User Exist, Notify The Client With The Following Message
        if (existingUser) {
            let message = "";
            if (existingUser.userName === userName) {
                message += "Username already exists. ";
                return { status: 400, message };
            }
            if (existingUser.userEmail === userEmail) {
                message += "Email already exists. ";
                return { status: 400, message };
            }
        }

        // Checking If User Entered A Referral Code Or Not
        // If Entered, Check That It Exist Or Not
        // If Not Entered, Set As ''
        const referredByUser = userReferredBy.length > 0 ? await accountsModel.findOne({ userReferralCode: userReferredBy }) : '';

        // If User Entered Wrong Referral Code, Return The Error
        if (referredByUser === null) {
            return { status: 200, message: "Wrong Referral Code" };
        }

        // Generating A Unique userReferralCode For The New User
        const userReferralCode = await generatingUserReferralCode();

        // Secure user password
        const encryptedPassword = await encryptPassword(userPassword);

        // Save New User Details To DB
        await new accountsModel({
            userFullName,
            userName,
            userEmail,
            userPassword: encryptedPassword,
            userReferralCode,
            userReferredBy: referredByUser.userReferralCode || "",
        }).save();

        // Generate And Securing an OTP
        const userOTP = await randomStringGenerator(6);
        const encryptedOTP = await encryptPassword(userOTP);

        // Send Un-Secured OTP To The User Registered E-Mail
        await sendOTPToUser(userName, userEmail, userOTP, 'signUp');

        // Saving Secured OTP to DB
        await new otpModel({ userName, OTP: encryptedOTP }).save();

        return { status: 201, message: "Account Created Successfully", userName };

    } catch (error) {
        return { status: 500, message: "Internal Server Error" };
    }
}

// Generating Unique Referral Code For New User
async function generatingUserReferralCode() {
    // Random 6 Digit Generation
    const userReferralCode = await randomStringGenerator(6);

    // Check If Code Already Exist In DB Or Not
    const existingCode = await accountsModel.findOne({ userReferralCode });

    // If Referral Code Exists, Regenerate New Code
    if (existingCode) {
        return generatingUserReferralCode();
    }
    return userReferralCode;
}

module.exports = signup;
