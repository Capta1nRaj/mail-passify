const { connect2MongoDB } = require("connect2mongodb");

const accountsModel = require("../models/accountsModel");
const sessionsModel = require("../models/sessionsModel");

const bcrypt = require("bcrypt");

const randomstring = require("randomstring");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPToUserMail = require("./sendOTPToUserMail");

async function signin(userEmail, userPassword) {
    await connect2MongoDB();

    async function getIPFromAmazon() {
        const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then((response) => response.json());
        return fetchingUserIP.ip;
    }

    const email = userEmail;

    const password = userPassword;

    const userIP = await getIPFromAmazon();

    const findEmailIDToLogin = await accountsModel.findOne({ userEmail: email });

    if (findEmailIDToLogin === null) {
        return {
            status: 204,
            message: "Please Validate Your Details",
        };
    } else if (findEmailIDToLogin !== null) {
        // Decrypting The Password From The User
        const decryptedPassword = await bcrypt.compare(password, findEmailIDToLogin.userPassword);

        if (findEmailIDToLogin.userEmail === email && decryptedPassword === true) {
            // Generating Token Address
            const userTokenAddress = randomstring.generate({
                length: 128,
                charset: ["abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=", "-"],
            });

            // Generating Random OTP
            const userOTP = randomstring.generate({
                length: 6,
                charset: ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"],
            });

            // Securing Token Via Bcrypt
            const randomSaltGenerator = Math.floor(Math.random() * 6) + 10;
            const bcryptToken = await bcrypt.hash(userTokenAddress, randomSaltGenerator);

            // Securing User IP Via Bcrypt
            const bcryptUserIP = await bcrypt.hash(userIP, randomSaltGenerator);

            // Securing OTP Via Bcrypt
            const bcryptOTP = await bcrypt.hash(userOTP, randomSaltGenerator);

            // Saving Details To DB
            new sessionsModel({
                userEmail: email,
                token: bcryptToken,
                userIP: bcryptUserIP,
                OTP: bcryptOTP,
            }).save();

            // Sending OTP To Mail
            await sendOTPToUserMail(findEmailIDToLogin.userName, email, userOTP);

            return {
                status: 200,
                message: "Sign In Successful, OTP Sent To Mail",
            };
        } else if (decryptedPassword === false) {
            return {
                status: 204,
                message: "Please Validate Your Details",
            };
        }
    }
}

module.exports = signin;