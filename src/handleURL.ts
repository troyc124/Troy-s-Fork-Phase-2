import axios from 'axios';
import logger from './logger';

//This function takes in a github repo URL and returns the owner's name and repo's name
export function gitURL(url: string): { owner:string; repo:string} | null {
    url = url.replace(/\.git$/,'');
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);

    if (match && match[1] && match[2]) {
        return { owner: match[1], repo: match[2]};
    }
    return null;
}

//This function takes in any URL and returns owner's name and repo's name
export async function handleURL(url: string): Promise<{owner: string; repo: string} | null> {
    //parse for packageName
    const regex = /npmjs\.com\/package\/([^\/]+)/;
    const packageName = url.match(regex);
    if (!(packageName && packageName[1])) {
        const result = gitURL(url);
        if (!result) {
            logger.debug('Error: URL not compatible. Please enter github.com or npmjs.com URL');
            return null;
        }
        else {
            logger.info(`Successfully fetched repository: ${result?.owner}/${result?.repo}`);
            return result;
        }
    }
    //get axios data
    try {
        const axios_response = await axios.get(`https://registry.npmjs.org/${packageName[1]}`);
        logger.info(`Fetched npm package: ${packageName[1]}`);
        const response_data = axios_response.data;
        const unfiltered_URL = response_data.repository.url;
        const result = gitURL(unfiltered_URL);
        if (!result) {
            logger.debug('Error: Package not hosted on github');
            return null;
        }
        logger.info(`Successfully fetched repository: ${result?.owner}/${result?.repo}`);
        return result;
    } 
    catch(error) {
        logger.debug(`Error fetching npm package: ${error}`);
        return null;
    }
}

//Additional Functions
//1)Function to handle when a npm url is not hosted on github
//      -process could be handled with convertURL
//          -use regex condition after axios_response line

////////////////TESTING///////////////////////////////////////
// async function main() {
//     const repoinfo = await handleURL('https://www.npmjs.com/package/express');
//     console.log("result",repoinfo);
// }
// main();