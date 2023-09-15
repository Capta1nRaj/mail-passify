#!/usr/bin/env node
const { connect2MongoDB } = require('connect2mongodb');
const settingsModel = require('../models/settingsModel')
const fs = require('fs');

async function generateConfigFile() {

    // Define the content of the configuration file
    const config = {
        "SENDGRID_SIGN_UP_MAIL_TITLE": "Custom-Signup-Title",
        "SENDGRID_SIGN_IN_MAIL_TITLE": "Custom-Signin-Title",
        "SENDGRID_FORGOT_PASSWORD_MAIL_TITLE": "Custom-Forgot-Password-Title",
        "COMPANY_WEBSITE_URL": "https://github.com/Capta1nRaj/mail-passify",
        "COMPANY_WEBSITE_ICON": "https://img.icons8.com/emoji/96/-emoji-admission.png",
        "COMPANY_WEBSITE_ICON_WIDTH": "40px",
        "COMPANY_CONTACT_MAIL": "trial@trial.com",
        "COMPANY_CUSTOMER_CARE_LINK": "https://support.github.com/",
        "COMPANY_INSTAGRAM_LINK": "https://github.com/Instagram",
        "COMPANY_INSTAGRAM_ICON": "https://img.icons8.com/ios-filled/50/instagram-new--v1.png",
        "COMPANY_TWITTER_LINK": "https://github.com/twitter",
        "COMPANY_TWITTER_ICON": "https://img.icons8.com/ios-filled/50/twitterx--v1.png",
        "COMPANY_YOUTUBE_LINK": "https://github.com/youtube",
        "COMPANY_YOUTUBE_ICON": "https://img.icons8.com/ios-filled/50/youtube-squared.png",
        "COMPANY_MAIL_LINK": "mail@mail.com",
        "COMPANY_MAIL_ICON": "https://img.icons8.com/ios-filled/50/upload-mail.png",
        "COMPANY_FACEBOOK_LINK": "https://github.com/facebook",
        "COMPANY_FACEBOOK_ICON": "https://img.icons8.com/ios-filled/50/meta.png",
        "COMPANY_ANDROID_APP_LINK": "https://github.com/android",
        "COMPANY_ANDROID_APP_ICON": "https://img.icons8.com/ios-filled/50/android-os.png",
        "COMPANY_IOS_APP_LINK": "https://apps.apple.com/us/app/github/id1477376905",
        "COMPANY_IOS_APP_ICON": "https://img.icons8.com/ios-filled/50/ios-logo.png",
        "REFERRED_POINTS": 0,
        "REFERRED_PERSON_POINTS": 0,
        "OTP_LIMITS": 0,
    }

    // Checking If File Don't Exist, Generate A File Else Don't
    const checkIfFileExistOrNot = fs.existsSync('mail-passify.json');

    if (checkIfFileExistOrNot === false) {

        // Write the configuration to a file
        fs.writeFileSync('mail-passify.json', JSON.stringify(config, null, 2));
        console.log('Configuration File Generated Successfully.');

    } else if (checkIfFileExistOrNot === true) {


    }
}
async function generateOrUpdatePoints() {

    let userConfiJSONData = fs.readFileSync('mail-passify.json');
    let userConfig = JSON.parse(userConfiJSONData);

    await connect2MongoDB()

    const checkingIfDataAlreadyGeneratedOrNot = await settingsModel.findOne({})

    if (!checkingIfDataAlreadyGeneratedOrNot) {

        // If No Document Exists In MongoDB, Create A New One.
        await new settingsModel({
            referred_points: userConfig.REFERRED_POINTS,
            referred_person_points: userConfig.REFERRED_PERSON_POINTS,
        }).save();

    } else {

        // Updating The Existing Points In Document With The User New Values/Points.
        await settingsModel.updateOne({}, {
            $set: {
                referred_points: userConfig.REFERRED_POINTS,
                referred_person_points: userConfig.REFERRED_PERSON_POINTS,
            },
        });

    }
}


async function runStepByStep() {
    await generateConfigFile()
    await generateOrUpdatePoints()
    process.exit()
}

runStepByStep()