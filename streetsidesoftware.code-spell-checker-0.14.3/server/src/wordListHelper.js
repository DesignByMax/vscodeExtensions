"use strict";
// cSpell:enableCompoundWords
const Rx = require("rx");
const Text = require("./util/text");
const fileReader_1 = require("./util/fileReader");
function loadWordsRx(filename) {
    return fileReader_1.lineReader(filename);
}
exports.loadWordsRx = loadWordsRx;
function splitLine(line) {
    return Text.extractWordsFromText(line).map(({ word }) => word).toArray();
}
exports.splitLine = splitLine;
function splitCodeWords(words) {
    return words
        .map(Text.splitCamelCaseWord)
        .reduce((a, b) => a.concat(b), []);
}
exports.splitCodeWords = splitCodeWords;
function splitLineIntoCodeWordsRx(line) {
    const asWords = splitLine(line);
    const splitWords = splitCodeWords(asWords);
    const wordsToAdd = [...asWords, ...splitWords];
    return Rx.Observable.fromArray(wordsToAdd);
}
exports.splitLineIntoCodeWordsRx = splitLineIntoCodeWordsRx;
function splitLineIntoWordsRx(line) {
    const asWords = splitLine(line);
    const wordsToAdd = [line, ...asWords];
    return Rx.Observable.fromArray(wordsToAdd);
}
exports.splitLineIntoWordsRx = splitLineIntoWordsRx;
/**
 * @deprecated
 */
function processWordListLinesRx(lines, minWordLength) {
    return processWordsRx(lines.flatMap(splitLineIntoCodeWordsRx));
}
exports.processWordListLinesRx = processWordListLinesRx;
/**
 * @deprecated
 */
function processWordsRx(lines) {
    return lines
        .map(word => word.trim().toLowerCase())
        .scan((acc, word) => {
        const { setOfWords } = acc;
        const found = setOfWords.has(word);
        if (!found) {
            setOfWords.add(word);
        }
        return { found, word, setOfWords };
    }, { setOfWords: (new Set()).add(''), found: false, word: '' })
        .filter(({ found }) => !found);
}
exports.processWordsRx = processWordsRx;
/**
 * @deprecated
 */
function processCodeWordsRx(entries, minWordLength) {
    return entries
        .flatMap(line => Rx.Observable.concat(
    // Add the line
    Rx.Observable.just(line), 
    // Add the individual words in the line
    Text.extractWordsFromTextRx(line)
        .map(({ word }) => word)
        .filter(word => word.length > minWordLength), 
    // Add the individual words split by camel case
    Text.extractWordsFromTextRx(line)
        .flatMap(Text.splitCamelCaseWordWithOffsetRx)
        .map(({ word }) => word)
        .filter(word => word.length > minWordLength)));
}
exports.processCodeWordsRx = processCodeWordsRx;
function rxSplitIntoWords(lines) {
    return lines.flatMap(line => Text.extractWordsFromTextRx(line)
        .map(match => match.word)
        .map(w => w.trim())
        .filter(w => w !== ''));
}
exports.rxSplitIntoWords = rxSplitIntoWords;
function rxSplitCamelCaseWords(words) {
    return words.flatMap(word => Text.splitCamelCaseWord(word));
}
exports.rxSplitCamelCaseWords = rxSplitCamelCaseWords;
function processWordsOld(lines) {
    return lines
        .map(word => word.trim())
        .scan((pair, word) => {
        const { setOfWords } = pair;
        const found = setOfWords[word] === true;
        setOfWords[word] = true;
        return { found, word, setOfWords };
    }, { setOfWords: Object.create(null), found: false, word: '' })
        .filter(({ found }) => !found);
}
exports.processWordsOld = processWordsOld;
//# sourceMappingURL=wordListHelper.js.map