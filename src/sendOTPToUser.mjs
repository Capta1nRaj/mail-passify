// Here OTP Will Be Sent To User Registered E-Mail Will Custom Title/Format Depending Upon The Request

import { config } from 'dotenv';
config();
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import fs from 'fs';
let userConfiJSONData = fs.readFileSync('mail-passify.json');
let userConfig = JSON.parse(userConfiJSONData);
let emailTemplate = fs.readFileSync('email-template.html', 'utf8');

async function sendOTPToUser(username, userEmail, otp, functionPerformed) {

  const userName = username.toLowerCase();

  let emailTitle;

  if (functionPerformed === 'signUp') {
    emailTitle = userConfig.SENDGRID_SIGN_UP_MAIL_TITLE;
  } else if (functionPerformed === 'signIn') {
    emailTitle = userConfig.SENDGRID_SIGN_IN_MAIL_TITLE;
  } else if (functionPerformed === 'forgotPassword') {
    emailTitle = userConfig.SENDGRID_FORGOT_PASSWORD_MAIL_TITLE;
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