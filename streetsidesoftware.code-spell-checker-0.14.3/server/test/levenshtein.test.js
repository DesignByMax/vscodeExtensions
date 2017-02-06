"use strict";
const chai_1 = require("chai");
const levenshtein_1 = require("../src/levenshtein");
describe('validate Levenshtein', () => {
    it('tests running vs raining', () => {
        const matrix = levenshtein_1.calcLevenshteinMatrix('running', 'raining');
        // console.log(levenshteinMatrixAsText(matrix));
        chai_1.expect(levenshtein_1.levenshteinMatrixAsText(matrix)).to.equal(levenshtein_1.calcLevenshteinMatrixAsText('running', 'raining'));
    });
    /*
    it('tests aaaaa vs aaaa', () => {
        const matrix = calcLevenshteinMatrix('aaaxyzaa', 'xyzaa');
        console.log(levenshteinMatrixAsText(matrix));
    });
    */
});
//# sourceMappingURL=levenshtein.test.js.map