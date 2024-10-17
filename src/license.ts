import axios from "axios";
import fs from "fs";
import path from "path";
import logger from "./logger";

export async function getLicense(ownerName: string, repoName: string) {
    try {
        // First, determine the default branch of the repository
        const defaultBranch = await getDefaultBranch(ownerName, repoName);

        const licenseContent = await downloadFileFromRepo(ownerName, repoName, 'LICENSE', defaultBranch);

        if (licenseContent && checkLicenseCompatibility(licenseContent)) {
            logger.debug('Compatible license found in LICENSE file');
            return 1;
        }

        const readmeContent = await downloadFileFromRepo(ownerName, repoName, 'README.md', defaultBranch);

        if (readmeContent && checkLicenseCompatibility(readmeContent)) {
            logger.debug('Compatible license found in README.md file');
            return 1;
        }

        logger.debug('No compatible license found');
        return 0;
    } catch (error: any) {
        logger.debug(`Error fetching license: ${error.message}`);
        return null;
    }
}

async function getDefaultBranch(ownerName: string, repoName: string): Promise<string> {
    const repoUrl = `https://api.github.com/repos/${ownerName}/${repoName}`;
    try {
        const response = await axios.get(repoUrl);
        const defaultBranch = response.data.default_branch;
        logger.debug(`Default branch for ${ownerName}/${repoName}: ${defaultBranch}`);
        return defaultBranch;
    } catch (error: any) {
        logger.debug(`Error fetching default branch: ${error.message}`);
        throw new Error('Failed to retrieve default branch');
    }
}

async function downloadFileFromRepo(ownerName: string, repoName: string, fileName: string, branch: string = 'main') {
    const url = `https://raw.githubusercontent.com/${ownerName}/${repoName}/${branch}/${fileName}`;
    try {
        const response = await axios.get(url);
        logger.debug(`${fileName} File downloaded successfully`);
        return response.data;
    } catch (error : any) {
        logger.debug(`Error downloading ${fileName}: ${error.message}`);
        return null;
    }
}

export function checkLicenseCompatibility(content: string) {
    // Convert content to lowercase to ensure case-insensitivity
    const lowerCaseContent = content.toLowerCase();

    const compatibleLicensesRegex = /lgplv2\.1|lesser general public license v2\.1|gplv2|general public license v2|mit license|bsd 2-clause license|bsd 3-clause license|apache license 2\.0/;
    
    const isCompatible = compatibleLicensesRegex.test(lowerCaseContent);
    logger.debug(`License compatibility: ${isCompatible ? 'Compatible' : 'Incompatible'}`);
    
    return isCompatible;
}