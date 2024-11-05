interface PackageJson {
    dependencies?: { [key: string]: string };
    devDependencies?: { [key: string]: string };
}

/**
 * Calculates the fraction of dependencies that are pinned to a specific major+minor version.
 * @param dependencies - An object where each key is a dependency name and each value is its version.
 * @returns The fraction of dependencies that are pinned to at least major and minor versions.
 */
export function calculatePinnedDependenciesFraction(dependencies: { [key: string]: string }): number {
    if (Object.keys(dependencies).length === 0) return 1.0; // No dependencies, so score is 1.0

    let pinnedCount = 0;

    Object.values(dependencies).forEach(version => {
        // Check if the version is pinned to major+minor by matching x.y.z or x.y format
        const isPinned = /^\d+\.\d+(\.\d+)?$/.test(version); // Matches "x.y" or "x.y.z" format

        if (isPinned) {
            pinnedCount++;
        }
    });

    // Calculate the fraction of pinned dependencies
    return pinnedCount / Object.keys(dependencies).length;
}

// Example usage with a sample dependencies list
const sampleDependencies = {
    "express": "4.17.1",
    "lodash": "^4.17.20",
    "react": "17.0.2",
    "typescript": "~4.3.2",
    "axios": "0.21.1"
};

const pinnedFraction = calculatePinnedDependenciesFraction(sampleDependencies);
console.log("Fraction of dependencies:", pinnedFraction);
