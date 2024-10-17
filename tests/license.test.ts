import { getLicense, checkLicenseCompatibility} from '../src/license'; // Import your getLicense function
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('getLicense', () => {
    jest.setTimeout(30000); // Increase timeout for the test
    let mock: MockAdapter;

    beforeAll(() => {
        // Create a new axios mock adapter instance
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        // Reset the mock adapter after each test to avoid test interference
        mock.reset();
    });

    afterAll(() => {
        // Restore axios after all tests are done
        mock.restore();
    });

    it('should return 1 if a compatible license is found in the LICENSE file', async () => {
        const ownerName = 'test-owner';
        const repoName = 'test-repo';
        const defaultBranch = 'main';

        // Mock the GitHub API to return the default branch
        mock.onGet(`https://api.github.com/repos/${ownerName}/${repoName}`).reply(200, {
            default_branch: defaultBranch
        });

        // Mock the raw.githubusercontent.com API to return a compatible license file
        mock.onGet(`https://raw.githubusercontent.com/${ownerName}/${repoName}/${defaultBranch}/LICENSE`).reply(200, 'GNU Lesser General Public License v2.1');

        const result = await getLicense(ownerName, repoName);

        // Check if it returns 1 for a compatible license
        expect(result).toBe(1);
    });

    it('should return 1 if a compatible license is found in the LICENSE file', async () => {
        const ownerName = 'test-owner';
        const repoName = 'test-repo';
        const defaultBranch = 'main';

        // Mock the GitHub API to return the default branch
        mock.onGet(`https://api.github.com/repos/${ownerName}/${repoName}`).reply(200, {
            default_branch: defaultBranch
        });

        // Mock the raw.githubusercontent.com API to return a compatible license file
        mock.onGet(`https://raw.githubusercontent.com/${ownerName}/${repoName}/${defaultBranch}/LICENSE`).reply(200, 'No License');
        // Mock the raw.githubusercontent.com API to return a compatible readme file
        mock.onGet(`https://raw.githubusercontent.com/${ownerName}/${repoName}/${defaultBranch}/README.md`).reply(200, 'GNU Lesser General Public License v2.1');

        const result = await getLicense(ownerName, repoName);

        // Check if it returns 1 for a compatible license
        expect(result).toBe(1);
    });

    it('should return 0 if the README.md file contains an incompatible license', async () => {
        const ownerName = 'test-owner';
        const repoName = 'test-repo';
        const defaultBranch = 'main';
    
        // Mock the GitHub API to return the default branch
        mock.onGet(`https://api.github.com/repos/${ownerName}/${repoName}`).reply(200, {
            default_branch: defaultBranch
        });
    
        // Mock the raw.githubusercontent.com API to simulate the LICENSE file not being present
        mock.onGet(`https://raw.githubusercontent.com/${ownerName}/${repoName}/${defaultBranch}/LICENSE`).reply(404);
    
        // Mock the raw.githubusercontent.com API to return an incompatible license in README.md
        mock.onGet(`https://raw.githubusercontent.com/${ownerName}/${repoName}/${defaultBranch}/README.md`).reply(200, 'Proprietary License');
    
        const result = await getLicense(ownerName, repoName);
    
        // Check if it returns 0 for an incompatible license in the README.md file
        expect(result).toBe(0);
    });

    it('should return true for LGPLv2.1', () => {
        const content = 'GNU Lesser General Public License v2.1';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Compatible with GPLv2
    it('should return true for GPLv2', () => {
        const content = 'GNU General Public License v2.0';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Compatible with MIT License
    it('should return true for MIT License', () => {
        const content = 'MIT License';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Compatible with BSD 2-Clause License
    it('should return true for BSD 2-Clause License', () => {
        const content = 'BSD 2-Clause License';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Compatible with BSD 3-Clause License
    it('should return true for BSD 3-Clause License', () => {
        const content = 'BSD 3-Clause License';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Compatible with Apache License 2.0
    it('should return true for Apache License 2.0', () => {
        const content = 'Apache License 2.0';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(true);
    });

    // Test case: Incompatible license
    it('should return false for an incompatible license', () => {
        const content = 'Proprietary License';
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(false);
    });

});