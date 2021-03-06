"use strict";
const chai_1 = require("chai");
const TextRange = require("../src/util/TextRange");
const RegExpPatterns_1 = require("../src/RegExpPatterns");
const RegPat = require("../src/RegExpPatterns");
const matchUrl = RegExpPatterns_1.regExMatchUrls.source;
const matchHexValues = RegExpPatterns_1.regExMatchCommonHexFormats.source;
describe('Validate InDocSettings', () => {
    it('tests finding a set of matching positions', () => {
        const text = sampleCode2;
        const ranges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExMatchUrls,
            RegPat.regExSpellingGuard,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        chai_1.expect(ranges.length).to.be.equal(8);
    });
    it('tests merging inclusion and exclusion patterns into an inclusion list', () => {
        const text = sampleCode2;
        const includeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExString,
            RegPat.regExPhpHereDoc,
            RegPat.regExCStyleComments,
        ], text);
        const excludeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExSpellingGuard,
            RegPat.regExMatchUrls,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        const mergedRanges = TextRange.excludeRanges(includeRanges, excludeRanges);
        chai_1.expect(mergedRanges.length).to.be.equal(21);
    });
    it('test for hex values', () => {
        chai_1.expect(RegPat.regExHexDigits.test('FFEE')).to.be.true;
    });
    it('tests finding matching positions', () => {
        const text = sampleCode2;
        const urls = TextRange.findMatchingRanges(matchUrl, text);
        chai_1.expect(urls.length).equals(2);
        const hexRanges = TextRange.findMatchingRanges(matchHexValues, text);
        chai_1.expect(hexRanges.length).to.be.equal(5);
        chai_1.expect(hexRanges[2].startPos).to.be.equal(text.indexOf('0xbadc0ffee'));
        const disableChecker = TextRange.findMatchingRanges(RegPat.regExSpellingGuard, text);
        chai_1.expect(disableChecker.length).to.be.equal(3);
        const hereDocs = TextRange.findMatchingRanges(RegPat.regExPhpHereDoc, text);
        chai_1.expect(hereDocs.length).to.be.equal(3);
        const strings = TextRange.findMatchingRanges(RegPat.regExString, text);
        chai_1.expect(strings.length).to.be.equal(12);
    });
});
const sampleCode2 = `
/*
 * this is a comment.\r
 */

const text = 'some nice text goes here';
const url = 'https://www.google.com?q=typescript';
const url2 = 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';
const cssHexValue = '#cccd';
const cHexValue = 0x5612abcd;
const cHexValueBadCoffee = 0xbadc0ffee;

// spell-checker:disable
const unicodeHexValue = '\\uBABC';
const unicodeHexValue2 = '\\x\{abcd\}';

// spell-checker:enable

/* More code and comments */

// Make sure /* this works.

/* spell-checker:disable */

// nested disabled checker is not supported.

// spell-checker:disable

// nested spell-checker:enable <--> checking is now turned on.

// This will be checked

/*
 * spell-checker:enable  <-- this makes no difference because it was already turned back on.
 */

let text = '';
for (let i = 0; i < 99; ++i) {
    text += ' ' + i;
}

const string1 = 'This is a single quote string.  it\'s a lot of fun.'
const string2 = "How about a double quote string?";
const templateString = \`
can contain " and '

 \`;

$phpHereDocString = <<<SQL
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpHereDocString = <<<"SQL"
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpNowDocString = <<<'SQL'
    SELECT * FROM users WHERE id in :ids;
SQL;

// cSpell:disable

Not checked.

`;
//# sourceMappingURL=RegExpPatterns.test.js.map