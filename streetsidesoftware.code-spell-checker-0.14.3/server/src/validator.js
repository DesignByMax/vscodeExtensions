"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const Rx = require("rx");
const tds = require("./TextDocumentSettings");
exports.diagSource = 'cSpell Checker';
const TV = require("./textValidator");
function validateTextDocument(textDocument, options) {
    return validateTextDocumentAsync(textDocument, options)
        .toArray()
        .toPromise();
}
exports.validateTextDocument = validateTextDocument;
function validateText(text, languageId, options) {
    const settings = tds.getSettings(options, text, languageId);
    const dict = tds.getDictionary(settings);
    return dict.then(dict => [...TV.validateText(text, dict, settings)]);
}
exports.validateText = validateText;
function validateTextDocumentAsync(textDocument, options) {
    return Rx.Observable.fromPromise(validateText(textDocument.getText(), textDocument.languageId, options))
        .flatMap(a => a)
        .filter(a => !!a)
        .map(a => a)
        .map(offsetWord => (__assign({}, offsetWord, { position: textDocument.positionAt(offsetWord.offset) })))
        .map(word => (__assign({}, word, { range: {
            start: word.position,
            end: (__assign({}, word.position, { character: word.position.character + word.word.length }))
        } })))
        .map(({ word, range }) => ({
        severity: 3 /* Information */,
        range: range,
        message: `Unknown word: "${word}"`,
        source: exports.diagSource
    }));
}
exports.validateTextDocumentAsync = validateTextDocumentAsync;
//# sourceMappingURL=validator.js.map