const randomstring = require("randomstring");

async function randomStringGenerator(length) {
    return randomstring.generate({
        length: length,
        charset: ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"],
    });
}

module.exports = randomStringGenerator;