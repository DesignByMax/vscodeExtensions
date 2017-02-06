"use strict";
const fs = require("fs");
const tsmerge_1 = require("tsmerge");
const json = require("comment-json");
const mkdirp = require("mkdirp");
const path = require("path");
const asPromise_1 = require("./asPromise");
const currentSettingsFileVersion = '0.1';
exports.sectionCSpell = 'cSpell';
exports.defaultFileName = 'cSpell.json';
const mkDirP = asPromise_1.asPromise(mkdirp);
const writeFile = asPromise_1.asPromise(fs.writeFile);
const readFile = asPromise_1.asPromise(fs.readFile);
const defaultSettings = {
    '//^': [
        '// cSpell Settings'
    ],
    '// version': ['\n    // Version of the setting file.  Always 0.1'],
    version: currentSettingsFileVersion,
    '// language': ['\n    // language - current active spelling language'],
    language: 'en',
    '// words': [`
    // words - list of words to be always considered correct`
    ],
    words: [],
    '// flagWords': [`
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    ],
    flagWords: ['hte'],
};
function getDefaultSettings() {
    return defaultSettings;
}
exports.getDefaultSettings = getDefaultSettings;
function readSettings(filename) {
    return readFile(filename)
        .then(buffer => buffer.toString(), () => json.stringify(defaultSettings, null, 4))
        .then(json.parse)
        .then(a => a, error => defaultSettings)
        .then(settings => tsmerge_1.merge(defaultSettings, settings));
}
exports.readSettings = readSettings;
function updateSettings(filename, settings) {
    return mkDirP(path.dirname(filename)).then(() => writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}
exports.updateSettings = updateSettings;
//# sourceMappingURL=CSpellSettings.js.map