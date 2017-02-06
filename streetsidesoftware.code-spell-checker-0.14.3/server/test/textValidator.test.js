"use strict";
const chai_1 = require("chai");
const textValidator_1 = require("../src/textValidator");
const SpellingDictionaryCollection_1 = require("../src/SpellingDictionaryCollection");
const SpellingDictionary_1 = require("../src/SpellingDictionary");
// cSpell:enableCompoundWords
describe('Validate textValidator functions', () => {
    // cSpell:disable
    it('tests splitting words', () => {
        const results = [...textValidator_1.wordSplitter('appleorange')];
        chai_1.expect(results).to.deep.equal([
            ['app', 'leorange'],
            ['appl', 'eorange'],
            ['apple', 'orange'],
            ['appleo', 'range'],
            ['appleor', 'ange'],
            ['appleora', 'nge'],
        ]);
    });
    // cSpell:enable
    it('tests trying to split words that are too small', () => {
        chai_1.expect([...textValidator_1.wordSplitter('')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('a')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('ap')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('app')]).to.be.deep.equal([]);
        // cSpell:disable
        chai_1.expect([...textValidator_1.wordSplitter('appl')]).to.be.deep.equal([]);
        // cSpell:enable
        chai_1.expect([...textValidator_1.wordSplitter('apple')]).to.be.deep.equal([]);
        chai_1.expect([...textValidator_1.wordSplitter('apples')]).to.be.deep.equal([
            ['app', 'les']
        ]);
    });
    it('tests hasWordCheck', () => {
        const dictCol = getSpellingDictionaryCollection();
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'brown', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'white', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'berry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'whiteberry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'redberry', true)).to.be.true;
        chai_1.expect(textValidator_1.hasWordCheck(dictCol, 'lightbrown', true)).to.be.true;
    });
    it('tests textValidator no word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, {});
        const errors = result.map(wo => wo.word).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe', 'lightbrown', 'whiteberry', 'redberry']);
    });
    it('tests textValidator with word compounds', () => {
        const dictCol = getSpellingDictionaryCollection();
        const result = textValidator_1.validateText(sampleText, dictCol, { allowCompoundWords: true });
        const errors = result.map(wo => wo.word).toArray();
        chai_1.expect(errors).to.deep.equal(['giraffe']);
    });
});
function getSpellingDictionaryCollection() {
    const dicts = [
        SpellingDictionary_1.createSpellingDictionary(colors),
        SpellingDictionary_1.createSpellingDictionary(fruit),
        SpellingDictionary_1.createSpellingDictionary(animals),
        SpellingDictionary_1.createSpellingDictionary(insects),
        SpellingDictionary_1.createSpellingDictionary(words),
    ];
    return new SpellingDictionaryCollection_1.SpellingDictionaryCollection(dicts);
}
const colors = ['red', 'green', 'blue', 'black', 'white', 'orange', 'purple', 'yellow', 'gray', 'brown'];
const fruit = [
    'apple', 'banana', 'orange', 'pear', 'pineapple', 'mango', 'avocado', 'grape', 'strawberry', 'blueberry', 'blackberry', 'berry'
];
const animals = ['ape', 'lion', 'tiger', 'Elephant', 'monkey', 'gazelle', 'antelope', 'aardvark', 'hyena'];
const insects = ['ant', 'snail', 'beetle', 'worm', 'stink bug', 'centipede', 'millipede', 'flea', 'fly'];
const words = ['the', 'and', 'is', 'has', 'ate', 'light', 'dark', 'little', 'big'];
const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;
//# sourceMappingURL=textValidator.test.js.map