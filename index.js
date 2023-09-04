const signup = require("./src/SignUP/signUp");
const signUpOTPSend = require("./src/SignUP/signUpOTPSend");
const signUpVerify = require("./src/SignUP/signUpVerify");

const signin = require("./src/SignIn/signIn");
const signInOTPSend = require("./src/SignIn/signInOTPSend");
const signInVerify = require("./src/SignIn/signInVerify");

module.exports = { signin, signInOTPSend, signInVerify, signup, signUpVerify, signUpOTPSend };

// db.sessions.updateOne( { userEmail: "priyalraj99@gmail.com" }, { $unset: { OTP: 1, expireAt: 1 },$set: { userVerified: true } } );
