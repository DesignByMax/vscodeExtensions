"use strict";
const SpellSettings = require("./CSpellSettingsServer");
exports.defaultLanguageSettings = [
    { languageId: '*', dictionaries: ['wordsEn', 'companies', 'softwareTerms', 'misc'], },
    { languageId: 'python', allowCompoundWords: true, dictionaries: ['python'] },
    { languageId: 'go', allowCompoundWords: true, dictionaries: ['go'], },
    { languageId: 'c', allowCompoundWords: true, dictionaries: ['cpp'], },
    { languageId: 'cpp', allowCompoundWords: true, dictionaries: ['cpp'], },
    { languageId: 'javascript', dictionaries: ['typescript', 'node'] },
    { languageId: 'javascriptreact', dictionaries: ['typescript', 'node'] },
    { languageId: 'typescript', dictionaries: ['typescript', 'node'] },
    { languageId: 'typescriptreact', dictionaries: ['typescript', 'node'] },
    { languageId: 'html', dictionaries: ['html', 'fonts', 'typescript', 'css'] },
    { languageId: 'php', dictionaries: ['php', 'html', 'fonts', 'css', 'typescript'] },
    { languageId: 'css', dictionaries: ['fonts', 'css'] },
    { languageId: 'less', dictionaries: ['fonts', 'css'] },
    { languageId: 'scss', dictionaries: ['fonts', 'css'] },
];
function getDefaultLanguageSettings() {
    return { languageSettings: exports.defaultLanguageSettings };
}
exports.getDefaultLanguageSettings = getDefaultLanguageSettings;
function calcSettingsForLanguage(languageSettings, languageId) {
    return exports.defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || s.languageId === languageId)
        .reduce((langSetting, setting) => {
        const { allowCompoundWords = langSetting.allowCompoundWords } = setting;
        const dictionaries = mergeUnique(langSetting.dictionaries, setting.dictionaries);
        return { languageId, allowCompoundWords, dictionaries };
    });
}
exports.calcSettingsForLanguage = calcSettingsForLanguage;
function calcUserSettingsForLanguage(settings, languageId) {
    const { languageSettings = [] } = settings;
    const { allowCompoundWords = settings.allowCompoundWords, dictionaries, dictionaryDefinitions } = calcSettingsForLanguage(languageSettings, languageId);
    return SpellSettings.mergeSettings(settings, { allowCompoundWords, dictionaries, dictionaryDefinitions });
}
exports.calcUserSettingsForLanguage = calcUserSettingsForLanguage;
function mergeUnique(a = [], b = []) {
    // Merge and Make unique
    return [...(new Set(a.concat(b)))];
}
//# sourceMappingURL=LanguageSettings.js.map