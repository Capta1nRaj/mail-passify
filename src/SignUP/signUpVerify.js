const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../../models/accountsModel");
const otpModel = require('../../models/otpModel')
const settingsModel = require('../../models/settingsModel')

const decryptPassword = require("../PasswordHashing/decryptPassword");

async function signUpVerify(userName, otp) {

    // If User Enters OTP With Length Greater Than 6, Throw An Error
    if (otp.length > 6) {
        return {
            status: 400,
            message: "Invalid OTP",
        };
    }

    await connect2MongoDB();

    // Firstly, It Will Find If User Exist In otpModel Or Not
    const getUserDetailsAndOTP = await otpModel.findOne({ userName: userName })

    // If No Document's With The Given userName Exist In DB, Return 400 Status Code
    if (!getUserDetailsAndOTP) {
        return {
            status: 400,
            message: "No Accounts Were Found To Verify",
        };
    }

    // Decrypting The OTP From The User
    const decryptedOTP = (otp === await decryptPassword(getUserDetailsAndOTP.OTP));

    // If User Enters Wrong OTP
    if (decryptedOTP === false) {

        return {
            status: 400,
            message: "Invalid OTP",
        };

        // If User Enters Correct OTP
    } else if (decryptedOTP === true) {

        // It Will Find The New User's userName, And As Per The Document, If The User Entered The Correct Referral Code, They Will Receive (Referred_points As Per The Json File) Points From The Referrer And Get Added To The Referrer's List With Their Name.
        // The Referrer Gets (Referred_person_points As Per The Json File) Points. 
        // If The User Didn't Enter Any Referral Code, Then They Will Not Get Any Points.
        const getTheUserWhomHeGotReferred = await accountsModel.findOne({ userName: getUserDetailsAndOTP.userName })

        // If User Is Referred By None
        if (getTheUserWhomHeGotReferred.userReferredBy.length === 0) {

            // It Will Simply Verify The User's Account.
            const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { $set: { userVerified: true }, $inc: { points: 0 } }, { new: true });

            // If User Is Referred By Someone
        } else if (getTheUserWhomHeGotReferred.userReferredBy.length !== 0) {

            // It Will Get The Points Values From The DB
            const getPointsValues = await settingsModel.findOne({})

            // First, It Will Verify The User's Account And Assign Them The Referral Points (REFERRED_PERSON_POINTS as per JSON File)
            const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { $set: { userVerified: true }, $inc: { points: getPointsValues.referred_person_points } }, { new: true });

            // Secondly, It Will Update The Points For The User (REFERRED_POINTS As Per JSON File) Who Referred Them And Add The User's userName To The Referrer's List
            // It Will User The Referral Code To Find The User Who Referred A New User
            var updateTheReferralPoints = await accountsModel.findOneAndUpdate({ userReferralCode: getTheUserWhomHeGotReferred.userReferredBy }, { $addToSet: { userReferrals: getTheUserWhomHeGotReferred.userName }, $inc: { points: getPointsValues.referred_points } }, { new: true });
        }

        // Delete The OTP From otpModel Collection
        const deleteUserOTPDocument = await otpModel.findOneAndDelete({ userName: userName })

        return {
            status: 202,
            message: "Account Verified"
        }
    }
}

module.exports = signUpVerify;