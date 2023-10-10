const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

async function signInVerify(userName, otp, id) {

    // If User Enters OTP With Length Greater Than 6, Throw An Error
    if (otp.length > 6) {
        return {
            status: 400,
            message: "Wrong OTP",
        };
    }

    await connect2MongoDB();

    try {

        // Finding Session Via ID
        const getDocumentViaID = await sessionsModel.findById(id)

        // Decrypting The OTP From The User
        const decryptedOTP = (otp === await decryptPassword(getDocumentViaID.OTP));

        // If userName Is Same, & OTP Is Also Same, Update The Session Fields, Else Throw An Error
        if (getDocumentViaID.userName === userName && decryptedOTP === true) {

            // This Will Update userVerified To True, Update ExpireAt After 10 Days, Remove OTP & OTPCount Fields Too
            await sessionsModel.findByIdAndUpdate(id, { userVerified: true, $unset: { OTP: 1, OTPCount: 1 }, $set: { expireAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } }, { new: true });

            return {
                status: 202,
                message: "Account Verified",
            }

        } else {

            return {
                status: 400,
                message: "Wrong OTP"
            }

        }

    } catch (error) {

        return {
            status: 400,
            message: "No Accounts Were Found To Verify",
        };

    }
}

module.exports = signInVerify