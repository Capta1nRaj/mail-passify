const signup = require("./src/signUp");
const signin = require("./src/signIn");

module.exports = { signup, signin };

// db.sessions.updateOne( { userEmail: "priyalraj99@gmail.com" }, { $unset: { OTP: 1, expireAt: 1 },$set: { userVerified: true } } );
