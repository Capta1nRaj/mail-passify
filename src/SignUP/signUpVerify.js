const { connect2MongoDB } = require("connect2mongodb");
const bcrypt = require("bcrypt");

const accountsModel = require("../../models/accountsModel");
const otpModel = require('../../models/otpModel')

async function signUpVerify(userName, otp) {

    await connect2MongoDB();

    const getUserDetailsAndOTP = await otpModel.findOne({ userName: userName })

    // Decrypting The OTP From The User
    const decryptedOTP = await bcrypt.compare(otp, getUserDetailsAndOTP.OTP);

    if (decryptedOTP === false) {
        return {
            status: 204,
            message: "Wrong OTP"
        }
    } else if (decryptedOTP === true) {

        // Will Verify User Account
        const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { $set: { userVerified: true }, $inc: { points: 10 } }, { new: true });

        // If The User Enters The Correct Referral Code, They Receive 50 Points From The Referrer And Get Added To The Referrer's List With Their Name.
        // And Referrer Gets 10 Points.
        const getTheUserWhomHeGotReferred = await accountsModel.findOne({ userName: getUserDetailsAndOTP.userName })
        var updateTheReferralPoints = await accountsModel.findOneAndUpdate({ userReferralCode: getTheUserWhomHeGotReferred.userReferredBy }, { $addToSet: { userReferrals: getTheUserWhomHeGotReferred.userName }, $inc: { points: 50 } }, { new: true });

        // Delete The OTP
        const deleteUserOTPDocument = await otpModel.findOneAndDelete({ userName: userName })

        return {
            status: 200,
            message: "Account Verified"
        }
    }
}

module.exports = signUpVerify;