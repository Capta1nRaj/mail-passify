#!/usr/bin/env node

import { connect2MongoDB } from 'connect2mongodb';
import settingsModel from '../models/settingsModel.mjs'
import fs from 'fs';

async function generateConfigFile() {

    // Defining The ContentS Of The Configuration File
    const config = {
        "SENDGRID_SIGN_UP_MAIL_TITLE": "Custom-Signup-Title",
        "SENDGRID_SIGN_IN_MAIL_TITLE": "Custom-Signin-Title",
        "SENDGRID_FORGOT_PASSWORD_MAIL_TITLE": "Custom-Forgot-Password-Title",
        "REFERRED_POINTS": 100,
        "REFERRED_PERSON_POINTS": 25,
        "OTP_LIMITS": 3,
    }

    // Checking If File Don't Exist, Generate A File Else Don't
    const checkIfFileExistOrNot = fs.existsSync('mail-passify.json');

    // If File Don't Exist, Then, Generate The File
    if (checkIfFileExistOrNot === false) {

        // Write the configuration to a file
        fs.writeFileSync('mail-passify.json', JSON.stringify(config, null, 2));
        console.log('Configuration File Generated Successfully.');

        // If Exist, Then, Skip
    } else if (checkIfFileExistOrNot === true) {


    }
}

// Updating The Points In The DB
async function generateOrUpdatePoints() {

    // Finding The File In The Dir
    let userConfiJSONData = fs.readFileSync('mail-passify.json');
    let userConfig = JSON.parse(userConfiJSONData);

    await connect2MongoDB()

    // Checking If Points Already Exist In DB Or Not
    const checkingIfDataAlreadyGeneratedOrNot = await settingsModel.findOne({})

    // If No Document Exists In DB, Create A New One.
    if (!checkingIfDataAlreadyGeneratedOrNot) {

        await new settingsModel({
            referred_points: userConfig.REFERRED_POINTS,
            referred_person_points: userConfig.REFERRED_PERSON_POINTS,
        }).save();

        // If Document Exists In DB, We Update It.
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

// Running Functions Step By Step
async function runStepByStep() {
    await generateConfigFile()
    await generateOrUpdatePoints()
    process.exit()
}

// Function Is Called Here
runStepByStep()