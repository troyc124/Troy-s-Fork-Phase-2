import { calculateCorrectness, fetchCorrectnessData, getCorrectness } from '../src/correctness'; // Adjust the path as necessary

describe('calculateCorrectness', () => {

    it('should return 0 when no issues are present', async () => {
        const mockIssues: any[] = [];
        const score = await calculateCorrectness(mockIssues);
        expect(score).toBe(0);
    });

    it('should return 1 when all issues are closed', async () => {
        const mockIssues: any[] = [
            { state: 'closed' },
            { state: 'closed' },
            { state: 'closed' },
        ];
        const score = await calculateCorrectness(mockIssues);
        expect(score).toBe(1);
    });

    it('should return 0 when all issues are open', async () => {
        const mockIssues: any[] = [
            { state: 'open' },
            { state: 'open' },
            { state: 'open' },
        ];
        const score = await calculateCorrectness(mockIssues);
        expect(score).toBe(0);
    });

    it('should return the correct score when some issues are closed', async () => {
        const mockIssues: any[] = [
            { state: 'closed' },
            { state: 'open' },
            { state: 'closed' },
            { state: 'open' }
        ];
        const score = await calculateCorrectness(mockIssues);
        expect(score).toBe(0.5); // 2 closed issues out of 4 total issues
    });

    it('should filter out pull requests and calculate score based on issues only', async () => {
        const mockIssues: any[] = [
            { state: 'closed', pull_request: true }, // Pull request (should be ignored)
            { state: 'closed' }, // Issue
            { state: 'open' },   // Issue
            { state: 'closed' }, // Issue
        ];
        const score = await calculateCorrectness(mockIssues);
        expect(score).toBe(2 / 3); // Only 3 valid issues (2 closed, 1 open)
    });

    it('should throw an error when using invalid repo or token', async () => {
        const invalidRepo = 'invalidRepo';
        const invalidOwner = 'invalidOwner';
        const invalidToken = 'invalidToken';
    
        // Expect the fetchCorrectnessData to reject with an error
        await expect(fetchCorrectnessData(invalidOwner, invalidRepo, invalidToken))
          .rejects
          .toThrow('Request failed with status code 401'); 
    });

    it('should return null when using invalid repo or token', async () => {
        const invalidRepo = 'invalidRepo';
        const invalidOwner = 'invalidOwner';
        const invalidToken = 'invalidToken';

        // Expect the getCorrectness to return null
        const score = await getCorrectness(invalidOwner, invalidRepo, invalidToken)
        expect(score).toBeNull();
    });
    
});
