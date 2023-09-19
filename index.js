// Sign-Up User Imports
const signup = require("./src/SignUP/signUp");
const signUpVerify = require("./src/SignUP/signUpVerify");

// Sign-In User Imports
const signin = require("./src/SignIn/signIn");
const signInVerify = require("./src/SignIn/signInVerify");

// Auto Sign In Session Check Imports
const autoSignIn = require("./src/AutoSignInCheck/autoSignIn");

// Logout User Imports
const logoutOnce = require("./src/logoutUser/logoutOnce");
const logoutAll = require("./src/logoutUser/logoutAll");

// Basic Features
const resendOTP = require("./src/resendOTP");
const forgotPassword = require("./src/forgotPassword");

module.exports = { signin, signInVerify, signup, signUpVerify, autoSignIn, logoutOnce, logoutAll, resendOTP, forgotPassword };