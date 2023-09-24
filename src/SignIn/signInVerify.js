const { connect2MongoDB } = require("connect2mongodb");
const decryptPassword = require("../PasswordHashing/decryptPassword");

const sessionsModel = require("../../models/sessionsModel");

async function signInVerify(userName, otp) {

    await connect2MongoDB();

    // Finding All The False userVerified Session Of The User Exist In DB
    const getUserOTPViaSession = await sessionsModel.find({ userName: userName, userVerified: false });

    // If No Users Found In The DB, Then, Return A Bad Request
    if (getUserOTPViaSession.length === 0) {
        return {
            status: 400,
            message: "No Accounts Were Found To Verify",
        };
    }

    // At First, We Will Be Decrypting The OTP From The User
    // If WIll Fetch All Sessions Of The User, & And Then Verify The Session Of The User With Has Same OTP & Token Value

    // Staring Count From 0
    let i = 0;

    // It Will Run A Loop From 0 To The Length Of The Session Of The User Received From DB
    while (i < getUserOTPViaSession.length) {

        // Getting The OTP Of The Given Index Of i
        const gettingOTPFromDB = getUserOTPViaSession[i].OTP;

        // If OTP Is Undefined, Keep The Loop Running
        if (gettingOTPFromDB === undefined) {

            // If OTP Is Not Undefined, Then, Check The OTP
        } else if (gettingOTPFromDB !== undefined) {

            // Decrypting The OTP From The User
            const decryptedOTP = (otp === await decryptPassword(gettingOTPFromDB));

            // IF OTP Is True, Using The Value Of i, Find The Session, & Update It
            if (decryptedOTP === true) {

                const gettingUserIDToUpdate = getUserOTPViaSession[i]._id;

                // This Will Update userVerified To True, Update ExpireAt After 10 Days, Remove OTP & OTPCount Fields
                await sessionsModel.findOneAndUpdate({ _id: gettingUserIDToUpdate }, { userVerified: true, $unset: { OTP: 1, OTPCount: 1 }, $set: { expireAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } }, { new: true });

                return {
                    status: 200,
                    message: "Account Verified"
                }

                // If No Correct OTP Is Found In Any Of The Session, Then, Return A Bad Request
            } else if (decryptedOTP === false && i === getUserOTPViaSession.length - 1) {
                return {
                    status: 400,
                    message: "Wrong OTP"
                }

            }
        }

        // Incrementing The Loop If Not Satisfied By Any Of The Sessions Above
        i++;

    }
}

module.exports = signInVerify