import { promises as fsPromises } from "fs";

let getUserConfig;

async function loadgetUserConfig() {
    try {
        const data = await fsPromises.readFile('mail-passify.json', 'utf-8');
        getUserConfig = JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

loadgetUserConfig();

export default getUserConfig;