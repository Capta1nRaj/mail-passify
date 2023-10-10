// Sign-Up User Imports
const signup = require("./src/SignUP/signUp");
const signUpVerify = require("./src/SignUP/signUpVerify");

// Sign-In User Imports
const signin = require("./src/SignIn/signIn");
const signInVerify = require("./src/SignIn/signInVerify");

// Session Check Imports
const sessionCheck = require("./src/SessionCheck/sessionCheck");

// Logout User Imports
const logoutOnce = require("./src/logoutUser/logoutOnce");
const logoutAll = require("./src/logoutUser/logoutAll");

// Basic Features
const resendOTP = require("./src/resendOTP");
const forgotPassword = require("./src/forgotPassword");

module.exports = { signin, signInVerify, signup, signUpVerify, sessionCheck, logoutOnce, logoutAll, resendOTP, forgotPassword };