"use strict";
const chai_1 = require("chai");
const CSpellSettingsServer_1 = require("../src/CSpellSettingsServer");
const path = require("path");
describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        chai_1.expect(CSpellSettingsServer_1.mergeSettings({}, {})).to.be.deep.equal({
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
        });
    });
    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', '..', 'server', 'sampleSourceFiles', 'cSpell.json');
        const settings = CSpellSettingsServer_1.readSettings(filename);
        const x = settings;
    });
});
//# sourceMappingURL=CSpellSettingsServer.test.js.map