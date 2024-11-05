// Import the function
import { calculatePinnedDependenciesFraction } from '../src/fractionDependencies';

// Define test cases
describe('calculatePinnedDependenciesFraction', () => {
    it('should return 1.0 for an empty dependencies object', () => {
        expect(calculatePinnedDependenciesFraction({})).toBe(1.0);
    });

    it('should return 0.5 for a mix of pinned and unpinned dependencies', () => {
        const dependencies = { "express": "4.17.1", "lodash": "^4.17.20" };
        expect(calculatePinnedDependenciesFraction(dependencies)).toBe(0.5);
    });

    it('should return 1.0 when all dependencies are pinned', () => {
        const dependencies = { "react": "17.0.2", "typescript": "4.3" };
        expect(calculatePinnedDependenciesFraction(dependencies)).toBe(1.0);
    });

    it('should return 0.5 when only one dependency is pinned to major+minor', () => {
        const dependencies = { "axios": "0.21", "jest": "26" };
        expect(calculatePinnedDependenciesFraction(dependencies)).toBe(0.5);
    });

    it('should return 0.0 when no dependencies are pinned', () => {
        const dependencies = { "webpack": "*", "babel": "^7.12.10" };
        expect(calculatePinnedDependenciesFraction(dependencies)).toBe(0.0);
    });
});
