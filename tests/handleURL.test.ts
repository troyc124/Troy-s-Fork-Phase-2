import { handleURL, gitURL } from '../src/handleURL';

describe('handleURL (and gitURL)', () => {
    it('should return null if input URL is not a github repository', async () => {
        const url = 'https://www.npmjs.com/package/express';
        const repoinfo = gitURL(url);
        expect(repoinfo).toBeNull();
    });
    it('should return repoinfo (owner, repo) if input URL is a github repository', async () => {
        const url = 'https://github.com/cloudinary/cloudinary_npm';
        const repoinfo = gitURL(url);
        const nonnull = repoinfo !== null;
        expect(nonnull).toBe(true);
    });
    it('should return null if input URL is invalid', async () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const repoinfo = await handleURL(url);
        expect(repoinfo).toBeNull();
    });
    it('should return repoinfo (owner, repo) if input URL is hosted on github', async () => {
        const url = 'https://www.npmjs.com/package/express';
        const repoinfo = await handleURL(url);
        const nonnull = repoinfo !== null;
        expect(nonnull).toBe(true);
    });
});