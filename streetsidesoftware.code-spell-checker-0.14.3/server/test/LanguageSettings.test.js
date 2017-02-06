"use strict";
const chai_1 = require("chai");
const LanguageSettings_1 = require("../src/LanguageSettings");
describe('Validate LanguageSettings', () => {
    it('tests merging language settings', () => {
        const sPython = LanguageSettings_1.calcSettingsForLanguage(LanguageSettings_1.defaultLanguageSettings, 'python');
        chai_1.expect(sPython.allowCompoundWords).to.be.true;
        chai_1.expect((sPython.dictionaries || []).sort()).to.be.deep.equal(['wordsEn', 'companies', 'softwareTerms', 'python', 'misc'].sort());
        const sPhp = LanguageSettings_1.calcSettingsForLanguage(LanguageSettings_1.defaultLanguageSettings, 'php');
        chai_1.expect(sPhp.allowCompoundWords).to.be.undefined;
        chai_1.expect((sPhp.dictionaries || []).sort())
            .to.be.deep.equal(['wordsEn', 'companies', 'softwareTerms', 'php', 'html', 'fonts', 'css', 'typescript', 'misc'].sort());
    });
});
//# sourceMappingURL=LanguageSettings.test.js.map