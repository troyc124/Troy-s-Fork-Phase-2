import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'owner_name';  // Replace with the GitHub repository owner
const REPO = 'repository_name';  // Replace with the GitHub repository name

async function getDependencies() {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/package.json`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'  // Fetches the raw file content
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch package.json: ${response.statusText}`);
        }

        // Explicitly parse JSON and type it to any to prevent TypeScript errors
        const packageJson: any = await response.json();
        
        // Access both dependencies and devDependencies
        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};

        console.log("Dependencies:");
        for (const [name, version] of Object.entries(dependencies)) {
            console.log(`${name}: ${version}`);
        }

        console.log("\nDev Dependencies:");
        for (const [name, version] of Object.entries(devDependencies)) {
            console.log(`${name}: ${version}`);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

getDependencies();
