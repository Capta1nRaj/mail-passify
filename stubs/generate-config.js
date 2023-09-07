#!/usr/bin/env node

const fs = require('fs');

// Define the content of the configuration file
const config = {
    "SENDGRID_SIGN_UP_MAIL_TITLE": "Welcome To The Family Mate.",
    "SENDGRID_SIGN_IN_MAIL_TITLE": "Please Verify Your Account",
    "COMPANY_WEBSITE_URL": "https://www.priyalraj.com/",
    "COMPANY_WEBSITE_ICON": "https://www.priyalraj.com/_next/image?url=%2Fassets%2Fimages%2FLogo%2Flogo-1.png&w=32&q=75",
    "COMPANY_WEBSITE_ICON_WIDTH": "30px",
    "COMPANY_CONTACT_MAIL": "feedback@yourcomapny.com",
    "COMPANY_CUSTOMER_CARE_LINK": "https://www.priyalraj.com/#contact",
    "COMPANY_INSTAGRAM_LINK": "https://www.instagram.com/capta1n_raj/",
    "COMPANY_INSTAGRAM_ICON": "https://img.icons8.com/color/48/instagram-new--v1.png",
    "COMPANY_TWITTER_LINK": "https://twitter.com/capta1n_raj",
    "COMPANY_TWITTER_ICON": "https://img.icons8.com/color/48/twitter--v1.png",
    "COMPANY_YOUTUBE_LINK": "https://www.youtube.com/captainraj",
    "COMPANY_YOUTUBE_ICON": "https://img.icons8.com/fluency/48/youtube-play.png",
    "COMPANY_MAIL_LINK": "company@mail.com",
    "COMPANY_MAIL_ICON": "https://img.icons8.com/fluency/48/mail--v1.png",
    "COMPANY_FACEBOOK_LINK": "https://github.com/facebook/react",
    "COMPANY_FACEBOOK_ICON": "https://img.icons8.com/fluency/48/facebook-new.png",
    "COMPANY_ANDROID_APP_LINK": "https://play.google.com/",
    "COMPANY_ANDROID_APP_ICON": "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
    "COMPANY_IOS_APP_LINK": "https://www.apple.com/in/app-store/",
    "COMPANY_IOS_APP_ICON": "https://w7.pngwing.com/pngs/1015/380/png-transparent-app-store-logo-iphone-app-store-google-play-apple-app-store-electronics-text-logo.png"
}


// Write the configuration to a file
fs.writeFileSync('mail-passify.json', JSON.stringify(config, null, 2));

console.log('Configuration file generated successfully.');