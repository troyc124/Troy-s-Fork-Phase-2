import axios, { all } from 'axios';
import logger from './logger';

export async function fetchCorrectnessData(ownerName: string, repoName: string, token: string) {
    let page = 1;
    const perPage = 100;
    let allIssues: any[] = [];
    let hasMoreIssues = true;

    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1)).toISOString();

    try {
        while(hasMoreIssues) {
            //logger.debug(`Fetching page ${page} of issues...`);
            const apiURL = `https://api.github.com/repos/${ownerName}/${repoName}/issues?state=all&per_page=${perPage}&page=${page}&since=${lastMonth}`;

            const response = await axios.get(apiURL, {
                headers: {
                    Authorization: `token ${token}`
                }
            });

            const issues = response.data;
            allIssues = [...allIssues, ...issues];
            hasMoreIssues = issues.length === perPage;
            page++;
        }

        return allIssues;
    } catch (error: any) {
        logger.debug(`Error fetching issues: ${error.message}`);
        throw error;
    }
}

export async function calculateCorrectness(issues: any[]) {
    try {
        //logger.debug(`Fetched ${issues.length} issues`);
        //Filter out pull requests
        const actualIssues = issues.filter((issue: any) => !issue.pull_request);
        logger.debug(`Found ${actualIssues.length} issues after filtering out pull requests`);

        if (actualIssues.length === 0) {
            logger.debug("No issues found in the last month");
            return 0;
        }

        //Count the number of closed issues
        const closedIssues = actualIssues.filter((issue: any) => issue.state === 'closed').length;
        
        //Calculate correctness score as the a ratio of closed to total issues
        const correctness = closedIssues / actualIssues.length;
        return correctness;
    } catch (error: any) {
        logger.debug(`Error calculating correctness: ${error.message}`);
        throw null;
    }
}

export async function getCorrectness(ownerName: string, repoName: string, token: string) {
    try {
        const issues = await fetchCorrectnessData(ownerName, repoName, token);
        const correctness = await calculateCorrectness(issues);
        logger.info(`Correctness score for ${ownerName}/${repoName}: ${correctness}`);
        return correctness
    } catch (error: any) {
        logger.debug(`Error calculating correctness: ${error.message}`);
        return null;
    }
}