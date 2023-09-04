const { connect2MongoDB } = require("connect2mongodb");

const sessionsModel = require("../../models/sessionsModel");

const bcrypt = require("bcrypt");

async function signInVerify(userName, otp) {

    await connect2MongoDB();

    const getUserOTPViaSession = await sessionsModel.findOne({ userName: userName })

    // Decrypting The OTP From The User
    const decryptedOTP = await bcrypt.compare(otp, getUserOTPViaSession.OTP);

    if (decryptedOTP === false) {
        return {
            status: 204,
            message: "Wrong OTP"
        }
    } else if (decryptedOTP === true) {

        const verifyUser = await sessionsModel.findOneAndUpdate({ userName: userName }, { userVerified: true })
        const updateSession = await sessionsModel.findOneAndUpdate({ userName: userName }, { $unset: { OTP: 1, expireAt: 1 }, $set: { userVerified: true } });
        return {
            status: 200,
            message: "Account Verified"
        }
    }
}

module.exports = signInVerify