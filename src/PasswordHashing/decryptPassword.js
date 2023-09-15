require("dotenv").config();
var crypto = require('crypto');
var secret_key = process.env.SECRET_KEY;
var secret_iv = process.env.SECRET_IV;
var encryptionMethod = 'AES-256-CBC';

var key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').slice(0, 32);
var iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').slice(0, 16);

async function decryptPassword(password) {
    try {

        const buff = Buffer.from(password, 'base64');
        password = buff.toString('utf-8');
        var decryptor = crypto.createDecipheriv(encryptionMethod, key, iv);
        return decryptor.update(password, 'base64', 'utf8') + decryptor.final('utf8');
    } catch (e) {

        return false;

    }
}

module.exports = decryptPassword;