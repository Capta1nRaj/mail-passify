const { connect2MongoDB } = require("connect2mongodb");
const bcrypt = require("bcrypt");

const accountsModel = require("../../models/accountsModel");
const otpModel = require('../../models/otpModel')

async function signUpVerify(userName, otp) {

    await connect2MongoDB();

    const getUserOTP = await otpModel.findOne({ userName: userName })

    // Decrypting The OTP From The User
    const decryptedOTP = await bcrypt.compare(otp, getUserOTP.OTP);

    if (decryptedOTP === false) {
        return {
            status: 204,
            message: "Wrong OTP"
        }
    } else if (decryptedOTP === true) {

        const verifyUser = await accountsModel.findOneAndUpdate({ userName: userName }, { userVerified: true })
        const deleteUserOTPDocument = await otpModel.findOneAndDelete({ userName: userName })

        return {
            status: 200,
            message: "Account Verified"
        }
    }
}

module.exports = signUpVerify;