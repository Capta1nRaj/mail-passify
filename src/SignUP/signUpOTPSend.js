require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fs = require('fs');
let userConfiJSONData = fs.readFileSync('mail-passify.json');
let userConfig = JSON.parse(userConfiJSONData);

async function signUpOTPSend(userName, userEmail, otp) {

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_EMAIL_ID,
    subject: userConfig.SENDGRID_SIGN_UP_MAIL_TITLE,
    html: `
        <div style="width: 100%; margin: auto; font-size: 14px">
          <span style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; width: 0"></span>
          <div style="background-color: rgb(237, 239, 244); padding-top: 15px; padding-bottom: 15px">
            <div style="width: 96%; margin: auto; max-width: 600px">
              <div style="display: flex; padding: 2% 5%; background-color: rgb(255, 255, 255); border: 1px solid rgb(232, 233, 237)">
                <a href=${userConfig.COMPANY_WEBSITE_URL} target="_blank">
                  <img src=${userConfig.COMPANY_WEBSITE_ICON} style="width: ${userConfig.COMPANY_WEBSITE_ICON_WIDTH}" class="CToWUd" data-bit="iit" />
                </a>
              </div>
              <div style="padding: 5%; text-align: left; background-color: rgb(255, 255, 255); border: 1px solid rgb(232, 233, 237); overflow: hidden">
                <div style="font-size: 22px; color: rgb(20, 27, 47); margin-bottom: 20px">OTP Verification Code</div>
                <div style="font-size: 14px; margin-bottom: 18px; line-height: 1.43">Hi ${userName},</div>
                <div style="font-size: 14px; margin-bottom: 18px; line-height: 1.43">Please enter the below code to complete verification:</div>
                <div style="font-size: 40px; margin-top: 20px">${otp}</div>
                <div style="font-size: 11px; color: rgb(114, 118, 130); margin-top: 20px">Valid for next 5 minutes.</div>
                <div style="margin-top: 20px"> If you did not raise this request, please write to <a href=${"mailto:" + userConfig.COMPANY_CONTACT_MAIL} target="_blank">${userConfig.COMPANY_CONTACT_MAIL}</a>
                </div>
              </div>
              <div style="height: 5px; font-size: 0px; background-color: #ff3258"></div>
              <div style="height: 5px; font-size: 0px; background-color: #111111"></div>
              <div style="margin-top: 20px; padding: 5% 4%; background-color: rgb(255, 255, 255); border: 1px solid rgb(232, 233, 237)">
                <div style="text-align: center; margin-bottom: 20px">
                  <p style="margin: 0px; font-size: 13px; font-weight: 600; margin-bottom: 7px">Customer Service</p>
                  <p style="margin: 0px; font-size: 11px; line-height: 1.36; color: rgb(114, 118, 130)"> Have questions? Please visit : <a href=${userConfig.COMPANY_CUSTOMER_CARE_LINK} target="_blank">${userConfig.COMPANY_CUSTOMER_CARE_LINK}</a>
                  </p>
                </div>
                <div style="font-size: 0">
                  <div style="display: inline-block; vertical-align: top; width: 39%">
                    <p style="margin: 0px; font-size: 13px; font-weight: 600; margin-bottom: 10px; white-space: nowrap">Connect with us</p>
                    <ul style="list-style: none; margin: 0; padding: 0; font-size: 0"> ${userConfig.COMPANY_INSTAGRAM_LINK === 'null' ? ` <li style="display: none;"></li>` : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 22%; max-width: 20px">
                        <a href=${userConfig.COMPANY_INSTAGRAM_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_INSTAGRAM_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} ${userConfig.COMPANY_TWITTER_LINK === 'null' ? ` <li style="display: none;"></li>` : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 22%; max-width: 20px">
                        <a href=${userConfig.COMPANY_TWITTER_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_TWITTER_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} ${userConfig.COMPANY_YOUTUBE_LINK === 'null' ? ` <li style="display: none;"></li>` : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 22%; max-width: 20px">
                        <a href=${userConfig.COMPANY_YOUTUBE_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_YOUTUBE_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} ${userConfig.COMPANY_FACEBOOK_LINK === 'null' ? ` <li style="display: none;"></li>` : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 22%; max-width: 20px">
                        <a href=${userConfig.COMPANY_FACEBOOK_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_FACEBOOK_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} ${userConfig.COMPANY_MAIL_LINK === 'null' ? ` <li style="display: none;"></li>` : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 22%; max-width: 20px">
                        <a href=${"mailto:" + userConfig.COMPANY_MAIL_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_MAIL_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} </ul>
                  </div> ${userConfig.COMPANY_ANDROID_APP_LINK === 'null' && userConfig.COMPANY_IOS_APP_LINK === 'null' ? ' <li style="display: none;"></li>' : ` <div style="display: inline-block; vertical-align: top; text-align: right; width: 60%">
                    <p style="margin: 0px; font-size: 13px; font-weight: 600; margin-bottom: 10px; white-space: nowrap">Download App</p>
                    <ul style="list-style: none; margin: 0; padding: 0; font-size: 0"> ${userConfig.COMPANY_ANDROID_APP_LINK === 'null' ? ' <li style="display: none;"></li>' : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 48%; max-width: 75px">
                        <a href=${userConfig.COMPANY_ANDROID_APP_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_ANDROID_APP_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} ${userConfig.COMPANY_IOS_APP_LINK === 'null' ? ' <li style="display: none;"></li>' : ` <li style="display: inline-block; vertical-align: top; margin: 0; padding: 0; width: 48%; max-width: 75px">
                        <a href=${userConfig.COMPANY_IOS_APP_LINK} style="display: block" target="_blank">
                          <img src=${userConfig.COMPANY_IOS_APP_ICON} alt="" style="display: block; max-width: 100%; width: 100%; height: auto" class="CToWUd" data-bit="iit" />
                        </a>
                      </li> `} </ul>
                  </div> `}
                </div>
              </div>
            </div>
          </div>
        </div>
        `,
  };

  sgMail.send(msg);
}

module.exports = signUpOTPSend