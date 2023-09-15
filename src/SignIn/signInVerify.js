const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

async function signInVerify(userName, otp) {

    await connect2MongoDB();

    const getUserOTPViaSession = await sessionsModel.find({ userName: userName })

    // Decrypting The OTP From The User
    let i = 0;
    while (i < getUserOTPViaSession.length) {

        const gettingOTPFromDB = getUserOTPViaSession[i].OTP;


        if (gettingOTPFromDB === undefined) {

        } else if (gettingOTPFromDB !== undefined) {

            // Decrypting The OTP From The User
            const decryptedOTP = (otp === await decryptPassword(gettingOTPFromDB));

            if (decryptedOTP === false) {

            } else if (decryptedOTP === false && i === getUserOTPViaSession.length) {

                return {
                    status: 204,
                    message: "Wrong OTP"
                }

            } else if (decryptedOTP === true) {

                const gettingUserIDToUpdate = getUserOTPViaSession[i]._id;

                const verifyUser = await sessionsModel.findOneAndUpdate({ _id: gettingUserIDToUpdate }, { userVerified: true })

                // This Will Update userVerified To True & Update ExpireAt After 10 Days
                const updateSession = await sessionsModel.findOneAndUpdate({ _id: gettingUserIDToUpdate }, { $unset: { OTP: 1 }, $set: { userVerified: true, expireAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } });

                return {
                    status: 200,
                    message: "Account Verified"
                }
            }
        }

        i++;
    }
}

module.exports = signInVerify