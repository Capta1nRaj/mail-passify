// Fetching User IP Using external-ip NPM Module

const externalIp = require("external-ip")();
const util = require("util");

// Promisify The External IP Function
const getIPAsync = util.promisify(externalIp);

// Fethcing User IP
async function fetchExternalIP() {
    try {
        const ip = await getIPAsync();
        return ip;
    } catch (err) {
        throw err;
    }
}

async function fetchUserIP() {
    try {
        const ip = await fetchExternalIP();
        // Converting The IP To A String
        const ipString = ip.toString();
        // Returning The IP
        return ipString;
    } catch (err) {
        console.error("Error While Fetching IP Is:- ", err);
    }
}

module.exports = fetchUserIP;