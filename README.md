# What Is Mail-Passify?

**Note:-** Please refer to the documentation on my GitHub repository in case I missed mentioning something here. Documentation for [v2.0.0]()

## Demo Link:-

To test a demo before using in your main project, visit here and read the README before starting:- [https://github.com/Capta1nRaj/mail-passify-demo](https://github.com/Capta1nRaj/mail-passify-demo)

## # Overview

Mail-Passify is a Node.js module that empowers you to create a robust user **sign-up** and **sign-in** system with **two-step verification** using **SendGrid**(freemium). It's also equipped with a **built-in referral system** to enhance user engagement and growth. **Note:-** It only supports MongoDB as database for now.

## # Features In v2.0.0

- ✅ [Sign-Up With Two-Step Verification.](https://github.com/Capta1nRaj/mail-passify#1-sign-up-)
- ✅ [Sign-In With Two-Step Verification.](https://github.com/Capta1nRaj/mail-passify#3-sign-in-)
- ✅ [No Disposable E-Mails Are Allowed To Signup.](https://github.com/Capta1nRaj/mail-passify#installation-)
- ✅ [Password's Are Encrypted With Crypto.](https://nodejs.org/api/crypto.html)
- ✅ [Resend OTP With Limited Requests.](https://github.com/Capta1nRaj/mail-passify#installation-)
- ✅ [Forgot Password With Two-Step Verification.](https://github.com/Capta1nRaj/mail-passify#7-forgot-password-)
- ✅ [Auto User Session Checking.](https://github.com/Capta1nRaj/mail-passify#5-auto-user-login-session-check-)
- ✅ [Logout Session From Current Device.](https://github.com/Capta1nRaj/mail-passify#6-logout-)
- ✅ [Logout Sessions From All Devices.](https://github.com/Capta1nRaj/mail-passify#6-logout-)
- ✅ [Referral System.](https://github.com/Capta1nRaj/mail-passify#installation-)

## # More Features To Be Added Later

* ❌ Lock User After N-Times Failed Login Attempts & Send Notification Email To The User.
* ❌ Unlock The Locked User Account (User + Auto).
* ❌ Add Phone Number In Accounts Model With 2 Step Verification.
* ❌ Change/Update User Info.
* ❌ Delete Account But Make Sure User Don't Get Referral Points Again Once He Sign Up With Any Referral Code.

## # Getting Started

### Installation:-

1. Begin by installing the packages:-

In back-end/server, install **mail-paasify**:-

```js
npm i mail-passify
```

Whereas, in front-end, for fetching cookies, install **cookies-next**:-
**Note:-** You can use your own method for fetching cookies.

```js
npm i cookies-next
```

2. Generate the configuration file in server by using the command:-

```js
npx mail-passify init
```

3. This will generate a ``mail-passify.json`` file. In this file, you can configure your data. Please ensure that you maintain the variables in the JSON file as specified below.
   
   | Name                                | Type    | Usage                                  |
   | ----------------------------------- | ------- | -------------------------------------- |
   | SENDGRID_SIGN_UP_MAIL_TITLE         | String  | Custom title for sign-up confirmation. |
   | SENDGRID_SIGN_IN_MAIL_TITLE         | String  | Custom title for sign-in confirmation. |
   | SENDGRID_FORGOT_PASSWORD_MAIL_TITLE | String  | Custom-Forgot-Password-Title.          |
   | COMPANY_WEBSITE_URL                 | String  | Your company's website URL.            |
   | COMPANY_WEBSITE_ICON                | String  | URL of your company's website icon.    |
   | COMPANY_WEBSITE_ICON_WIDTH          | String  | Width of the website icon.             |
   | COMPANY_CONTACT_MAIL                | String  | Company's contact email address.       |
   | COMPANY_CUSTOMER_CARE_LINK          | String  | Link for customer support.             |
   | COMPANY_INSTAGRAM_LINK              | String  | Link to your Instagram profile.        |
   | COMPANY_INSTAGRAM_ICON              | String  | URL of the Instagram icon.             |
   | COMPANY_TWITTER_LINK                | String  | Link to your Twitter profile.          |
   | COMPANY_TWITTER_ICON                | String  | URL of the Twitter icon.               |
   | COMPANY_YOUTUBE_LINK                | String  | Link to your YouTube channel.          |
   | COMPANY_YOUTUBE_ICON                | String  | URL of the YouTube icon.               |
   | COMPANY_MAIL_LINK                   | String  | Company's email address.               |
   | COMPANY_MAIL_ICON                   | String  | URL of the mail icon.                  |
   | COMPANY_FACEBOOK_LINK               | String  | Link to your Facebook page.            |
   | COMPANY_FACEBOOK_ICON               | String  | URL of the Facebook icon.              |
   | COMPANY_ANDROID_APP_LINK            | String  | Link to your Android app.              |
   | COMPANY_ANDROID_APP_ICON            | String  | URL of the Android app icon.           |
   | COMPANY_IOS_APP_LINK                | String  | Link to your iOS app.                  |
   | COMPANY_IOS_APP_ICON                | String  | URL of the iOS app icon.               |
   | REFERRED_POINTS                     | Integer | Points awarded to the referrer.        |
   | REFERRED_PERSON_POINTS              | Integer | Points awarded to the referred person. |
   | OTP_LIMITS                          | Integer | Max Times User Can Request For OTP.    |

4. Once you update these values, again run this command to update your referral points values in your MongoDB database:-

```js
npx mail-passify init
```

5. Include and configure the following in your .env file:

```js
MONGODB_URI = YOUR_MONGODB_URI (mongodb://127.0.0.1:27017/DB-NAME)
SENDGRID_API_KEY = YOUR_SENDGRID_API_KEY
SENDGRID_EMAIL_ID = YOUR_SENDGRID_EMAIL_ID
SECRET_KEY = YOUR_SECRET_KEY_FOR_ENCRYPTION_OF_LENGTH_32_OR_GREATER
SECRET_IV = YOUR_SECRET_IV_FOR_ENCRYPTION_OF_LENGTH_32_OR_GREATER
ALLOWED_EMAIL_DOMAINS=@gmail.com,@hotmail.com YOU_CAN_ADD_MORE_BY_SEPERATING_WITH_,(comma)
```

## # Usage

### 1. Sign Up:-

To get started, set up the sign-up module data in the Front-End first and pass it to the Back-End **(you can use your preferred method to send the data)**:-

```js
const data = {fullName, userName, emailID, password, referralCode};
// You can use fetch or any method you are comfortable with.
const response = await axios.post('YOUR_URL', data);
```

Next, configure the sign-up module on the Back-End:-

```js
const { signup } = require("mail-passify");
const response = await signup(fullName, userName, emailID, password, referralCode);
console.log(response);
```

After the user signs up, they will receive an OTP on their registered email. Consequently, you will receive a response similar to this:-

```js
return {
   status: 201,
   message: "Account Created Successfully",
   userName: username,
};
```

Following that, in your front-end code, use cookies-next to store the userName **(which we obtained from the response above)** in the browser's cookies:

```js
import { setCookie } from 'cookies-next';
const setUserNameCookies = setCookie('userName', getUserNameFromResponse);
```

After sending the OTP, redirect the user to the account verification page and follow the steps provided.

### 2. Sign Up Verify:-

To start, in your front-end code, use **cookies-next** to extract the userName from cookies, as well as the **OTP** entered by the user. Then, send this data to the Back-End:-

```js
import { getCookie } from 'cookies-next';
const userNameCookie = getCookie('userName');
const data = {userNameCookie, OTP};
const response = await axios.post('YOUR_URL', data);
```

Set up the sign-up verify module in Back-End. Make sure to fetch userName from **cookies** as we stored it above.

```js
const { signUpVerify } = require("mail-passify");
const response = await signUpVerify(userNameCookie, OTP);
console.log(response);
```

After the user verifies their account in the **MongoDB accounts model**, the userVerified section in their document will change from **false** to **true**. If they have been **referred**, they will also receive **referral points**. As a result, you will receive a response similar to this:-

```js
return {
   status: 200,
   message: "Account Verified"
}
```

### 3. Sign In:-

To get started, set up the sign-in module data in the Front-End first and pass it to the Back-End **(you can use your preferred method to send the data)**:-

```js
const data = {userName, userPassword};
// You can use fetch or any method you are comfortable with.
const response = await axios.post('YOUR_URL', data);
```

Next, configure the sign-in module on the Back-End:-

```js
const { signin } = require("mail-passify");
const response = await signin(userName, userPassword)
console.log(response);
```

After the user signs in with correct details, if the user is registered & has verified their account, they will receive an OTP on their email. You will receive this response, and you should then redirect them to the sign-in verification page:-

```js
return {
   status: 200,
   message: "Sign In Successful, OTP Sent To Mail",
   userName: username,
   token: userTokenAddress,
   id: savedData.id
};
```

**Note:-** If the user is registered but hasn't verified their account, you will receive this response, and you should redirect them to the verification/signUpVerify page:-

```js
return {
   status: 401,
   message: "Please Verify Your Account",
   userName: username,
}
```

As we did above, store the userName, token, & Id in cookies that we received from the response above ***(similar like this)***:-

```js
import { setCookie } from 'cookies-next';
const setUserNameCookies = setCookie('userName', getUserNameFromResponse);
const setToken = setCookie('token', getTokenFromResponse);
const setId = setCookie('token', getIdFromResponse);
```

### 4. Sign-in Verify:-

As mentioned above, the user has signed in with their details, and they are verified, then, you have redirected them to the sign-in verification page. To proceed, use the following functions in the front-end to pass the data to the Back-End:-

```js
import { getCookie } from 'cookies-next';
const userNameCookie = getCookie('userName');
const userIdCookie = getCookie('userId');
const data = {userNameCookie, OTP, userId}
const response = await axios.post('YOUR_URL', data)
```

Once the data is sent to the Back-End, use this method to verify the user:-

```js
const { signInVerify } = require("mail-passify");
const response = await signInVerify(userNameCookie, OTP, userId);
console.log(response);
```

If the user enters the correct OTP, in the **MongoDB Session Model**, the user document **OTP field** will be removed, and the document's expiry will be changed to 10 days. In return, you will receive this response:-

```js
return {
   status: 202,
   message: "Account Verified"
}
```

### 5. Auto User Session Check:-

What if the user's session has expired, and they are still logged in, or if they attempt to manipulate cookies and perform unauthorized actions? You know that's not good, right? So, use the `sessionCheck()` function to verify if the user's session is legitimate and active. Follow these steps:-

```js
const { autoSignIn } = require("mail-passify");
const userNameCookie = getCookie('userName');
const userTokenCookie = getCookie('userToken');
const userIdCookie = getCookie('userId');
const response = await sessionCheck(userNameCookie, userTokenCookie, userId);
// Note:- IP Will Be Automatically Fetched.
```

If the user is legitimate, you will receive this response, and their session will remain logged in:-

```js
return {
   status: 202,
   message: "Session Exist"
}
```

Else, if there are no session found, then, redirect them to the login page. The response you will receive is:-

```js
return {
   status: 400,
   message: "Session Don't Exist"
}
```

### 6. Logout:-

There are **2 methods** to logout the user:-

1. [Logout Current Session Only:-](https://github.com/Capta1nRaj/mail-passify#method-1-current-session-only-) The user gets logged out only from the current device.
2. [Logout All Sessions:-](https://github.com/Capta1nRaj/mail-passify#method-2-all-sessions-) The user gets logged out from all sessions.

#### Method 1 (Current Session Only):-

To begin, fetch **userName** and **token** from cookies in the Front-End, then pass them to the Back-End, similar like this:-

```js
import { getCookie } from 'cookies-next';
const userNameCookie = getCookie('userName');
const userTokenCookie = getCookie('userToken ');
const userIdCookie = getCookie('userId');
const data = { userNameCookie, userTokenCookie, userIdCookie };
const response = await axios.post('YOUR_URL', data);
```

Once the data is passed to the Back-End, use the **logoutOnce** function to remove the session from MongoDB, like this:-

```js
const { logoutOnce } = require("mail-passify");
const response = await logoutOnce(userNameCookie, userTokenCookie, userId)
```

Once the user's session is deleted, redirect them to homepage, & you will receive this response:-

```js
return {
   status: 200,
   message: "User Session Deleted.",
};
```

After deleting the session from MongoDB, please clear the user's browser cookies via the Front-End like this:-

```js
import { deleteCookie } from 'cookies-next';
deleteCookie('userNameCookie');
deleteCookie('userTokenCookie');
```

#### Method 2 (All Sessions):-

All steps are the same as we did above in **Method 1**, just in the Back-End, you need to change the imports like this:-

```js
const { logoutAll } = require("mail-passify");
const response = await logoutOnce(userNameCookie, userTokenCookie, userIdCookie)
```

### 7. Forgot Password:-

To begin, get **userName** in the Front-End, then pass them to the Back-End, similar like this:-

```js
const data = { userName }
const response = await axios.post('YOUR_URL', data)
```

Once the data is passed to the Back-End, use the **forgotPassword** function to reset/update the password in MongoDB like this:-

```js
const { forgotPassword } = require("mail-passify");
const response = await forgotPassword(userName);
```

After this, it will first verify whether the user exists in MongoDB or not. If the user exists, you will receive this response:-

```js
return {
   status: 201,
   message: "OTP Sent To Mail",
   userName: userName,
};
```

Kindly save the userName to cookies as we did above. After that, pass your OTP and newPassword to the Back-End via the Front-End similar like this:-

```js
const userNameCookie = getCookie('userName');
const data = { userNameCookie, OTP, newPassword }
const response = await axios.post('YOUR_URL', data)
```

Once the data is received in the back-end, please perform the following actions:-

```js
const response = await forgotPassword(userNameCookie, OTP, newPassword)
```

Now, firstly, we will check if the OTP is correct or not. If the OTP is correct, we will update the new password. Once the password is updated, you will receive a response like this:-

```js
return {
   status: 200,
   message: "Password Updated."
}
```

To resend OTP for the **forgot password** functionality, use these values:-

```js
const response = await resendOTP(userNameCookie, 'forgotPassword')
```

### 8. Resend OTP:-

There are **3 functions** to send OTP to the user:-

1. [Resend OTP For New/Unverified User.](https://github.com/Capta1nRaj/mail-passify#function-1-for-new-users-)
2. [Resend OTP For Old/Verified User.](https://github.com/Capta1nRaj/mail-passify#function-2-for-old-users-)
3. [Resend OTP For Forgot Password.](https://github.com/Capta1nRaj/mail-passify#function-3-for-forgot-password-)

#### Function 1 (For New Users):-

Once the user is on **signup verify page**, & if he requests to resend the OTP, use this below syntax in your front-end:-

```js
const userNameCookie = getCookie('userName');
const method = 'newUserVerification'; //This Helps Module To Know That Resend OTP For The unverified User
const data = { userNameCookie, method };
const response = await axios.post('YOUR_URL', data)
```

Once the data is received in the back-end, please perform the following actions:-

```js
const response = await resendOTP(data.userNameCookie, data.method)
```

Now it will find the document in the DB, & update the new OTP in the document, & will also increment the OTPCount by +1. Once the OTP is sent to the user, & updated in the DB, then, you will receive a response like this:-

```js
return {
   status: 201,
   message: "OTP Resent To The User.",
};
```

If the OTPCount === OTP_LIMITS(mailpassify.json), then, it will not send OTP to the user, and you will receive a response like this:-

```js
return {
   status: 403,
   message: "Max OTP Limit Reached, Please Try After 10 Minutes."
};
```

**Note:-** Once the OTP limits are reached, the user can try again after waiting for 5-10 minutes, as the OTP document from the database will be automatically deleted after this period.

#### Function 2 (For Old Users):-

Once the user is on **signin verify page**, & if he requests to resend the OTP, use this below syntax in your front-end:-

```js
const userNameCookie = getCookie('userName');
const userTokenCookie = getCookie('userToken');
const userIdCookie = getCookie('userId');
const method = 'oldUserVerification'; //This Helps Module To Know That Resend OTP For The verified User
const data = { userNameCookie, method, userTokenCookie, userIdCookie };
const response = await axios.post('YOUR_URL', data)
```

Now it will find the document in the DB, & update the new OTP in the document, & will also increment the OTPCount by +1. Once the OTP is sent to the user, & updated in the DB, then, you will receive a response like this:-

```js
return {
   status: 201,
   message: "OTP Resent To The User.",
};
```

If the OTPCount === OTP_LIMITS(mailpassify.json), then, it will not send OTP to the user, and you will receive a response like this:-

```js
return {
   status: 403,
   message: "Max OTP Limit Reached, Please Try After 10 Minutes."
};
```

**Note:-** If a user reaches the maximum OTP request limit, they can still attempt to sign in again, which will generate different values.

#### Function 3 (For Forgot Password):-

Once the user is on **forgot password page**, & if he requests to resend the OTP, use this below syntax in your front-end:-

```js
const userNameCookie = getCookie('userName');
const method = 'forgotPassword'; //This Helps Module To Know That Resend OTP For The forgotPassword User
const data = { userNameCookie, method };
const response = await axios.post('YOUR_URL', data)
```

Once the data is received in the back-end, please perform the following actions:-

```js
const response = await resendOTP(data.userNameCookie, data.method)
```

Now it will find the document in the DB, & update the new OTP in the document, & will also increment the OTPCount by +1. Once the OTP is sent to the user, & updated in the DB, then, you will receive a response like this:-

```js
return {
   status: 201,
   message: "OTP Resent To The User.",
};
```

If the OTPCount === OTP_LIMITS(mailpassify.json), then, it will not send OTP to the user, and you will receive a response like this:-

```js
return {
   status: 403,
   message: "Max OTP Limit Reached, Please Try After 10 Minutes."
};
```

**Note:-** Once the OTP limits are reached, the user can try again after waiting for 5-10 minutes, as the OTP document from the database will be automatically deleted after this period.
