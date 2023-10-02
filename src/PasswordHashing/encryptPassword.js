require("dotenv").config();
var crypto = require('crypto');
var secret_key = process.env.SECRET_KEY;
var secret_iv = process.env.SECRET_IV;
var encryptionMethod = 'AES-256-CBC';

var key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').slice(0, 32);
var iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').slice(0, 16);

async function encryptPassword(password) {
    try {

        var encryptor = crypto.createCipheriv(encryptionMethod, key, iv);
        var aes_encrypted = encryptor.update(password, 'utf-8', 'base64') + encryptor.final('base64');
        return Buffer.from(aes_encrypted).toString('base64');

    } catch (e) {

        console.log("Error In File encryptPassword.js, Please Raise An Issue, Thanks Mate ♥.")
        return false;

    }
}

module.exports = encryptPassword;