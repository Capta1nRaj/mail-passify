const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../../models/accountsModel");
const otpModel = require('../../models/otpModel')
const settingsModel = require('../../models/settingsModel')

const fs = require('fs');
const decryptPassword = require("../PasswordHashing/decryptPassword");

async function signUpVerify(userName, otp) {

    await connect2MongoDB();

    const getUserDetailsAndOTP = await otpModel.findOne({ userName: userName })

    // Decrypting The OTP From The User
    const decryptedOTP = (otp === await decryptPassword(getUserDetailsAndOTP.OTP));

    if (decryptedOTP === false) {
        return {
            status: 204,
            message: "Wrong OTP"
        }
    } else if (decryptedOTP === true) {

        const getPointsValues = await settingsModel.findOne({})

        // If The User Enters The Correct Referral Code, They Receive 50 Points From The Referrer And Get Added To The Referrer's List With Their Name.
        // And Referrer Gets 10 Points.
        const getTheUserWhomHeGotReferred = await accountsModel.findOne({ userName: getUserDetailsAndOTP.userName })

        if (getTheUserWhomHeGotReferred.userReferredBy.length === 0) {

            // Will Verify User Account
            const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { $set: { userVerified: true }, $inc: { points: 0 } }, { new: true });

        } else if (getTheUserWhomHeGotReferred.userReferredBy.length !== 0) {

            // Will Verify User Account
            const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { $set: { userVerified: true }, $inc: { points: getPointsValues.referred_person_points } }, { new: true });

            var updateTheReferralPoints = await accountsModel.findOneAndUpdate({ userReferralCode: getTheUserWhomHeGotReferred.userReferredBy }, { $addToSet: { userReferrals: getTheUserWhomHeGotReferred.userName }, $inc: { points: getPointsValues.referred_points } }, { new: true });
        }

        // Delete The OTP
        const deleteUserOTPDocument = await otpModel.findOneAndDelete({ userName: userName })

        return {
            status: 200,
            message: "Account Verified"
        }
    }
}

module.exports = signUpVerify;