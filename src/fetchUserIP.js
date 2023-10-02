// Fetching User IP

async function fetchUserIP() {
    const fetchingUserIP = await fetch("https://api.ipify.org/?format=json").then((response) => response.json());
    return fetchingUserIP.ip;
}

module.exports = fetchUserIP;