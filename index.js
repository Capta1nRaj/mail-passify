const { connect2MongoDB } = require('connect2mongodb');

const accountsModel = require('./models/accountsModel');
const otpModel = require('./models/otpModel');

const bcrypt = require('bcrypt');

const randomstring = require('randomstring');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function signup(userFullName, userName, userEmail, userPassword, userReferredBy) {

    await connect2MongoDB();

    // Getting Data From The Client
    const fullname = userFullName;
    const username = userName;
    const email = userEmail;
    const password = userPassword;
    var referredby = userReferredBy;

    // Checking If UserName Already Exists In DB Or Not
    const findIfUserNameAlreadyExistInDBOrNot = await accountsModel.findOne({ userName: username });

    // Checking If EmailId Already Exists In DB Or Not
    const findIfEmailIDAlreadyExistInDBOrNot = await accountsModel.findOne({ userEmail: email });

    // Checking If userReferralCode Exist In DB Or Not
    if (userReferredBy.length === 0) {
        referredby = ''
    } else if (userReferredBy.length !== 0) {
        var checkIfuserReferralCodeExistInDBOrNot = await accountsModel.findOne({ userReferralCode: referredby })
    }

    if (findIfUserNameAlreadyExistInDBOrNot !== null) {

        return {
            status: 200,
            message: 'User name already exists',
        }

    } else if (findIfEmailIDAlreadyExistInDBOrNot !== null) {

        return {
            status: 200,
            message: 'Email id already exists',
        }

    } else if (checkIfuserReferralCodeExistInDBOrNot === null) {

        return {
            status: 200,
            message: 'Wrong Referral Code',
        }

    } else if (findIfUserNameAlreadyExistInDBOrNot === null && findIfEmailIDAlreadyExistInDBOrNot === null && checkIfuserReferralCodeExistInDBOrNot !== null) {

        // User Unique Referral Code
        const userReferralCode = await generatingUserReferralCode();

        if (checkIfuserReferralCodeExistInDBOrNot === undefined) {
            referredby = ''
        } else if (checkIfuserReferralCodeExistInDBOrNot !== undefined) {
            // If The User Enters The Correct Referral Code, They Receive 50 Points From The Referrer And Get Added To The Referrer's List With Their Name.
            await accountsModel.findOneAndUpdate({ userName: checkIfuserReferralCodeExistInDBOrNot.userName }, { $addToSet: { userReferrals: username }, $inc: { points: 50 } }, { new: true })
        }

        // Securing Password Via Bcrypt
        const randomSaltGenerator = Math.floor(Math.random() * 6) + 10;
        const bcryptPasswprd = await bcrypt.hash(password, randomSaltGenerator)

        // Saving Details To DB
        new accountsModel({
            userFullName: fullname,
            userName: username,
            userEmail: userEmail,
            userPassword: bcryptPasswprd,
            userReferralCode: userReferralCode,
            userReferredBy: referredby,
        }).save();

        return {
            status: 201,
            message: 'Account created successfully',
        }
    }

    // Generating A Unique Referral Code For User & Checking That If It's Exist In DB Or Not
    // Once It Get's An Unique UserReferralCode, It Will Save The User Referral Code To DB
    async function generatingUserReferralCode() {

        const userReferralCode = randomstring.generate({
            length: 6,
            charset: ['abcdefghijklmnopqrstuvwxyz0123456789']
        });

        // Checking If UserReferralCode Exist In DB Or Not
        const checkIfuserReferralCodeExistInDBOrNot = await accountsModel.findOne({ userReferralCode: userReferralCode })

        // If Code Exist In DB, Then, Rerun The Function Else Retrun The Code.
        if (checkIfuserReferralCodeExistInDBOrNot !== null) {
            await generatingUserReferralCode()
        } else if (checkIfuserReferralCodeExistInDBOrNot === null) {
            return userReferralCode;
        }
    }
}

async function signin(userEmail, userPassword) {

    await connect2MongoDB();

    const email = userEmail;

    const password = userPassword;

    const findEmailIDToLogin = await accountsModel.findOne({ userEmail: email });

    if (findEmailIDToLogin === null) {

        return {
            status: 204,
            message: "Please Validate Your Details"
        }

    } else {

        // Decrypting The Password From The User
        const decryptedPassword = await bcrypt.compare(password, findEmailIDToLogin.userPassword);

        if (findEmailIDToLogin.userEmail === email && decryptedPassword === true) {

            return {
                status: 200,
                message: 'Sign In Successful'
            }
        } else if (decryptedPassword === false) {

            return {
                status: 204,
                message: 'Please Validate Your Details'
            }
        }
    }
}

async function generateOTP(userEmail, mailTitle) {

    await connect2MongoDB();

    // Generating Random OTP
    const otp = randomstring.generate({
        length: 6,
        charset: ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789']
    });

    const checkIfOTPIsAlreadyGeneratedOrNot = await otpModel.findOne({ userEmail: userEmail })

    if (checkIfOTPIsAlreadyGeneratedOrNot === null) {

        await sendOTPToUserMail(userEmail, otp, mailTitle);

        // Saving OTP To DB
        new otpModel({
            userEmail: userEmail,
            OTP: otp,
        }).save();

    } else if (checkIfOTPIsAlreadyGeneratedOrNot !== null) {
        // If OTP Once Sent But User Requrest For New OTP, It WIll Generate New OTP & Update In The DB
        const checkIfOTPIsAlreadyGeneratedOrNot = await otpModel.findOneAndUpdate({ userEmail: userEmail }, { OTP: otp })

        await sendOTPToUserMail(userEmail, otp, mailTitle);
    }


    return {
        status: 201,
        message: 'OTP Sent To Mail Address'
    }
}

async function sendOTPToUserMail(userEmail, otp, mailTitle) {
    const msg = {
        to: userEmail,
        from: process.env.SENDGRID_EMAIL_ID,
        subject: mailTitle,
        html: `
        <div style="color:blue;font-size:46px;text-align:center;margin:auto;background-color:gray;">
            <div>Please Verify Your Account.</div>    
            <div>Your OTP is ${otp}</div>
        </div>
        `,
    };

    sgMail.send(msg)
        .then(() => console.log('Email sent successfully'))
        .catch((error) => console.error(error));
}

async function temp(data) {

    await connect2MongoDB();

    const findIfEmailIDAlreadyExistsInDB = await accountsModel.findOne({ userReferralCode: data }).explain('executionStats');

    console.log(findIfEmailIDAlreadyExistsInDB)
}

module.exports = { signup, signin, generateOTP, temp }