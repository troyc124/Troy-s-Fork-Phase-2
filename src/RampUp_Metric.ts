import logger from './logger';

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');

// Placeholder for the GitHub token
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';

// If authentication is not needed, set Authorization_Needed to false
// If authentication is needed, set Authorization_Needed to true
const Authorization_Needed = false;
// logger.info(`Currently, Authorization Needed is set to: ${Authorization_Needed}`);
// logger.info("If authorization is needed, please set the GITHUB_TOKEN at the top of the file and Authorization_Needed to true.");

// Milestone: 3
// Task 2:  - Implement Ramp-Up Metric
//          - Create Unit Test Cases
// Creation date: 10.16.2020
// Last modified: 10.16.2020

/*

/ To Do:
// Download a repository from GitHub
// Delete the repository from the local machine
// Implement the function to download the repository from GitHub
// Implement the function to delete the repository from the local machine

Ramp Up:
We can look at the documentation and check if it contains helpful sections
like installation, examples, troubleshooting, FAQ, etc in the README.

Havine more sections will give a higher score since it gives more information 
to new users.

The score will be normalized to fall between 0 and 1.

Sections that are considered helpful are:
- Table of [Cc]ontents 
- Installation
- Examples
- Troubleshooting
- FAQ
- Key [Ff]eatures
- Features
- Version [Ss]upport
- Support
- Usage
- License
- Known [Ii]ssues
- Commands
- Setup
- Getting [Ss]tarted
- Settings
- Configuration
- Dependencies
- Roadmap
- Development
- Debugging
- Testing
- Details
- Building
- Legal
- Changelog

The formula to calculate the score is:
score = (actual number of sections) / (expected number of sections)

*/

// Expected number of sections
const expectedSections = 26;
// logger.info(`Expected number of sections: ${expectedSections}`);

// Function to get the default branch of a GitHub repository
// Needed to make sure we download the correct branch
// Because SOME people decide to use names other than 'main'
async function getDefaultBranch(repoUrl: string) {
    var response;

    // Parse the repository URL to get the username and repository name
    const urlParts = new URL(repoUrl);
    // Split the pathname by '/' and remove any empty strings
    const [username, repo] = urlParts.pathname.split('/').filter(Boolean);
    // Construct the API URL to get the repository info
    const apiUrl = `https://api.github.com/repos/${username}/${repo}`;
    
    // Fetch the repository info
    // Add the GitHub token if authenticated requests are needed. Go to top of file to set the token.
    try {
        if (Authorization_Needed) {
            response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`
                }
            });
        }
        else {
            response = await axios.get(apiUrl);
        }
        
        // Get data
        const data = response.data;
        return data.default_branch;
    }
    catch (error) {
        // console.log(`Error fetching default branch: ${error}`);
        logger.debug(`Error fetching default branch: ${error}`);
    }
}
async function downloadGitHubRepo(repoUrl: string, destinationFolder: string) {
    if(repoUrl == null) {
        logger.debug('Repository URL is null');
        return;
    }
    else if(destinationFolder == null) {
        logger.debug('Destination folder is null');
        return;
    }
    else if(repoUrl == "Skip") {
        // Skip the download
        return;
    }
    // console.log(`Downloading repository from ${repoUrl} to ${destinationFolder}`);
    logger.info(`Downloading repository from ${repoUrl} to ${destinationFolder}`);

    try {
        // Get the default branch name
        // console.log(`Fetching default branch for ${repoUrl}`);
        logger.info(`Fetching default branch for ${repoUrl}`);
        const defaultBranch = await getDefaultBranch(repoUrl);
        // console.log(`Default branch: ${defaultBranch}`);
        logger.info(`Default branch: ${defaultBranch}`);

        // Get last path of the URL
        const urlParts = new URL(repoUrl);
        const repoName = urlParts.pathname.split('/').filter(Boolean).pop();
        // console.log(`Repository name: ${repoName}`);
        logger.info(`Repository name: ${repoName}`);

        // Concat path and default branch ("path-defaultBranch")
        const pathDefaultBranch = `./${repoName}-${defaultBranch}`;
        // console.log(`Path and default branch: ${pathDefaultBranch}`);
        logger.info(`Path and default branch: ${pathDefaultBranch}`)

        // Construct the download URL
        const downloadUrl = `${repoUrl}/archive/${defaultBranch}.zip`;
        // console.log(`Download URL: ${downloadUrl}`);
        logger.info(`Download URL: ${downloadUrl}`);

        // Fetch the repository zip
        const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer'
        });
        // console.log(`Repository zip fetched`);
        logger.info(`Repository zip fetched`);

        // Write the zip to a file
        fs.writeFileSync(`${pathDefaultBranch}.zip`, response.data);
        // console.log(`Repository zip saved`);
        logger.info(`Repository zip saved`);

        // Extract the zip to the specified directory
        const zip = new AdmZip(`${pathDefaultBranch}.zip`);
        zip.extractAllTo(destinationFolder, true);
        // console.log(`Repository downloaded and extracted to ${destinationFolder}`);
        logger.info(`Repository downloaded and extracted to ${destinationFolder}`);

        // Delete the zip file
        fs.rmSync(`${pathDefaultBranch}.zip`);
        // console.log(`Repository zip deleted`);
        logger.info(`Repository zip deleted`);

        // Return the path to the extracted folder
        // console.log(`Repository downloaded and extracted to ${destinationFolder}`);
        logger.info(`Repository downloaded and extracted to ${destinationFolder}`);
        return pathDefaultBranch;
    } catch (error) {
        // console.log(`Error downloading repository: ${error}`);
        logger.debug(`Error downloading repository: ${error}`);
    }
}
function readFiles(dirPath: string) {
    var files = fs.readdirSync(dirPath);
    // console.log(`Reading files from ${dirPath}`);
    // logger.info(`Reading files from ${dirPath}`);

    // Read current directory and check if README.md exists
    if (files.includes('README.md')) {
        return ['README.md', dirPath];
    }
    // If README.md does not exist in the current directory, read through all the folders until it is found
    // If not found, return 'false' (no README.md found)
    else {
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                let dir_files = readFiles(filePath);
                if(dir_files.includes('README.md')) {
                    return ['README.md', filePath];
                }
            }
        }
    }
    return 'false';
}
function checkSections(files: string | any[]) {
    // If files doesn't exist, return 0
    // console.log('files: ' + files);
    logger.info(`files: ${files}`);

    if(files == null) {
        // console.log(`No files found in the directory`);
        logger.info(`No files found in the directory`);
        return 0;
    }
    // If README.md wasn't found, return 0
    else if(files == "false") {
        // console.log(`No README.md found`);
        logger.info(`No README.md found`);
        return 0;
    }
    // console.log(`Reading README.md from ${files[1]}/${files[0]}`);
    logger.info(`Reading README.md from ${files[1]}/${files[0]}`);

    const content = fs.readFileSync(path.join(files[1], files[0]), 'utf8');
    let score = 0;
    const sections = [  'Table of Contents', 'Table of contents', 'Installation', 'Examples', 'Troubleshooting', 
                        'FAQ', 'Key Features', 'Key features', 'Features', 'Version Support', 'Version support', 
                        'Support', 'Usage', 'License', 'Known Issues', 'Known issues', 'Commands', 'Setup', 
                        'Getting Started', 'Getting started', 'Settings', 'Configuration', 'Dependencies', 'Roadmap', 
                        'Development', 'Debugging', 'Testing', 'Details', 'Building', 'Legal', 'Changelog'];
    for (const section of sections) {
        if (content.includes(section)) {
            score++;
        }
    }
    // Return a float between 0 and 1
    logger.info(`Ramp up score: ${score / expectedSections}`);
    score = score / expectedSections;
    let rounded_score: number = Math.round(score*100)/100;
    return rounded_score;
}
function deleteFolder(folderPath: string | undefined) {
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            // console.log(`Folder ${folderPath} has been deleted.`);
            logger.info(`Folder ${folderPath} has been deleted.`);
        } else {
            // console.log(`Folder ${folderPath} does not exist.`);
            logger.info(`Folder ${folderPath} does not exist.`);
        }
    } catch (error) {
        // console.error(`Error deleting folder: ${error}`);
        logger.debug(`Error deleting folder: ${error}`);
    }
}
export async function test_RampUp(url: string) {
    // Call the function to download the repository from GitHub
    const filetoDelete = await downloadGitHubRepo(url, './');
    logger.info(`Repository downloaded and extracted to ${filetoDelete}`);
    // Call the function to read all the files in the directory
    // Use './' to read the current directory
    // Use '../' to read the parent directory
    // Temporary Local Folder: ./temp_repo
    const dirPath = path.join(__dirname, '../');
    const files = readFiles(dirPath);

    // If "false" is returned, no README.md was found, score is 0
    var score = checkSections(files);

    // Delete the repository from the local machine
    await deleteFolder(filetoDelete);
    
    logger.info(`Ramp up score for ${url}: ${score}`);
    // console.log(`Ramp up score for ${url}: ${score}`);
    return score;
}
export async function getRampUp(ownerName: string, repoName: string, token: string) {
    try {
        const filetoDelete = await downloadGitHubRepo(repoName, './');
        const dirPath = path.join(__dirname, '../');
        const files = readFiles(dirPath);
        var score = checkSections(files);
        
        await deleteFolder(filetoDelete);
       
        logger.info(`Ramp up score for ${ownerName}/${repoName}: ${score}`);
        return score;
    } catch (error) {
        logger.info('Error fetching and calculating ramp up score');
        return null;
    }
}
// test_RampUp("https://github.com/cloudinary/cloudinary_npm");
// test_RampUp("https://github.com/octocat/Hello-World/");
// test_RampUp("https://github.com/nullivex/nodist");
// test_RampUp("https://github.com/lodash/lodash");