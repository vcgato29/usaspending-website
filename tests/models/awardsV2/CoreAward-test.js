/**
 * CoreAward-test.js
 * Created by David Trinh 10/10/18
 */

import CoreAward from 'models/v2/awardsV2/CoreAward';

const awardData = {
    subawardTotal: '12004.75',
    baseExercisedOptions: '2342342.32'
};

const award = Object.create(CoreAward);
award.populateCore(awardData);

describe('Core Award getter functions', () => {
    it('should format the subaward total', () => {
        expect(award.subawardTotal).toEqual('$12,005');
    });
    it('should format the base exercised pptions', () => {
        expect(award.baseExercisedOptions).toEqual('$2.34 million');
    });
});
