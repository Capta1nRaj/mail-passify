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
            message: "Hello Mr. Developer, I Think You Should Check That The Client Must Pass 2 Data Set Not 1."
        }

    } else if (userName.length !== 0 && token.length !== 0) {

        const userIP = await getIPFromUser();

        const checkUserSessionExistOrNot = await sessionsModel.find({ userName: userName })

        console.log(checkUserSessionExistOrNot)

        let i = 0;
        while (i < checkUserSessionExistOrNot.length) {

            // Decrypting The Password From The User
            const decryptingToken = await bcrypt.compare(token, checkUserSessionExistOrNot[i].token);

            if (decryptingToken === false && i === checkUserSessionExistOrNot.length - 1) {
                return {
                    status: 204,
                    message: "Session Don't Exist"
                }
            } else if (decryptingToken === true) {
                return {
                    status: 202,
                    message: "Session Exist"
                }
            } else if (decryptingToken === false) {

            }

            i++;
        }


        // return checkUserSessionExistOrNot;
    }
}

module.exports = autoSignIn