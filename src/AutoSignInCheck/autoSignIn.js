const { connect2MongoDB } = require("connect2mongodb");

const sessionsModel = require("../../models/sessionsModel");

const bcrypt = require("bcrypt");

require("dotenv").config();

async function autoSignIn(userName, token) {

    await connect2MongoDB()

    async function getIPFromUser() {
        const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then((response) => response.json());
        return fetchingUserIP.ip;
    }

    if (userName.length === 0 || token.length === 0) {

        return {
            status: 69,
            message: "Hello Mr. Developer, I think you should check that the client must pass 2 data sets, not 1. Till we meet again, have a nice day :-)."
        }

    } else if (userName.length !== 0 && token.length !== 0) {

        const userIP = await getIPFromUser();

        const checkUserSessionExistOrNot = await sessionsModel.find({ userName: userName })

        if (checkUserSessionExistOrNot.length === 0) {
            return {
                status: 204,
                message: "Session Don't Exist"
            }
        }

        let i = 0;

        while (i < checkUserSessionExistOrNot.length) {

            // Decrypting The Password From The User
            // const decryptingToken = await bcrypt.compare(token, checkUserSessionExistOrNot[i].token);

            // Decrypting The User IP
            const decryptingUserIP = await bcrypt.compare(userIP, checkUserSessionExistOrNot[i].userIP);

            if (checkUserSessionExistOrNot[i].token !== token && i === checkUserSessionExistOrNot.length - 1) {

                return {
                    status: 204,
                    message: "Session Don't Exist"
                }

            } else if (checkUserSessionExistOrNot[i].token === token && checkUserSessionExistOrNot[i].userVerified === true && decryptingUserIP === true) {

                return {
                    status: 202,
                    message: "Session Exist"
                }

            }

            i++;
        }
    }
}

module.exports = autoSignIn