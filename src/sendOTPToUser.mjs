// Here OTP Will Be Sent To User Registered E-Mail Will Custom Title/Format Depending Upon The Request

import { config } from 'dotenv';
config();
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import fs from 'fs';
let emailTemplate = fs.readFileSync('email-template.html', 'utf8');

async function sendOTPToUser(username, userEmail, otp, functionPerformed) {

  // It Will Fetch Settings, & Get The Titles From The DB
  const fetchSettings = await settingsModel.findOne({})

  const userName = username.toLowerCase();

  let emailTitle;

  if (functionPerformed === 'signUp') {
    emailTitle = fetchSettings.sendgrid_sign_up_mail_title;
  } else if (functionPerformed === 'signIn') {
    emailTitle = fetchSettings.sendgrid_sign_in_mail_title;
  } else if (functionPerformed === 'forgotPassword') {
    emailTitle = fetchSettings.sendgrid_forgot_password_mail_title;
  }

  const replacedHtml = emailTemplate
    .replaceAll('{{userName}}', userName)
    .replaceAll('{{otp}}', otp)

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_EMAIL_ID,
    subject: emailTitle,
    html: replacedHtml
  };

  sgMail.send(msg);
}

export default sendOTPToUser;