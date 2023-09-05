const signup = require("./src/SignUP/signUp");
const signUpOTPSend = require("./src/SignUP/signUpOTPSend");
const signUpVerify = require("./src/SignUP/signUpVerify");

const signin = require("./src/SignIn/signIn");
const signInOTPSend = require("./src/SignIn/signInOTPSend");
const signInVerify = require("./src/SignIn/signInVerify");

const autoSignIn = require("./src/AutoSignInCheck/autoSignIn");

const accountsModel = require("./models/accountsModel");
const { connect2MongoDB } = require("connect2mongodb");

async function temp() {

    await connect2MongoDB();

    const data = await accountsModel.findOne({ userName: 'rohitsubaml' })
    console.log(data);

}

module.exports = { signin, signInOTPSend, signInVerify, signup, signUpVerify, signUpOTPSend, autoSignIn, temp };

// db.sessions.updateOne( { userEmail: "priyalraj99@gmail.com" }, { $unset: { OTP: 1, expireAt: 1 },$set: { userVerified: true } } );
