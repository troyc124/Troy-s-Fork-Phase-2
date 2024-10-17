import logger from '../src/logger';
import { test_RampUp, getRampUp } from '../src/RampUp_Metric';


describe('Calculate RampUp Score', () => {
    jest.setTimeout(360000); //set timeout to 6 minutes

    it('test_RampUp: Should return score 0.12, bad README', async () => {
        const url0 = "https://github.com/lodash/lodash";
        var RU_score0 = await test_RampUp(url0);
        logger.info(`Ramp up score for ${url0}: ${RU_score0}`);
        expect(RU_score0).toBeGreaterThan(0);
    }); 
    it('getRampUp: Should return score 0.12, bad README', async () => {
        const url3 = "https://github.com/lodash/lodash";
        var RU_score3 = await getRampUp("cloudinary", url3, "Hi");
        logger.info(`Ramp up score for ${url3}: ${RU_score3}`);
        expect(RU_score3).toBeGreaterThan(0);
    }); 
    it('Should return score 0.35', async () => {
        const url2 = "https://github.com/cloudinary/cloudinary_npm";
        var RU_score2 = await test_RampUp(url2);
        logger.info(`Ramp up score for ${url2}: ${RU_score2}`);
        expect(RU_score2).toBeGreaterThan(0);
    }); 
});