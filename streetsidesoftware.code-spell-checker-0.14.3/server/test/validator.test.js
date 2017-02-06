"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const chai_1 = require("chai");
const Validator = require("../src/validator");
const loremIpsum = require('lorem-ipsum');
const DefaultSettings_1 = require("../src/DefaultSettings");
const defaultSettings = DefaultSettings_1.getDefaultSettings();
describe('Validator', function () {
    this.timeout(5000);
    it('validates the validator', () => {
        const results = Validator.validateText('The quick brouwn fox jumpped over the lazzy dog.', 'plaintext', defaultSettings);
        return results.then(results => {
            const words = results.map(({ word }) => word);
            chai_1.expect(words).to.be.deep.equal(['brouwn', 'jumpped', 'lazzy']);
        });
    });
    it('validates ignore Case', () => {
        const results = Validator.validateText('The Quick brown fox Jumped over the lazy dog.', 'plaintext', defaultSettings);
        return results.then(results => {
            const words = results.map(({ word }) => word);
            chai_1.expect(words).to.be.deep.equal([]);
        });
    });
    it('validate limit', () => {
        const results = Validator.validateText(loremIpsum({ count: 5, unit: 'paragraphs' }), 'plaintext', __assign({}, defaultSettings, { maxNumberOfProblems: 10 }));
        return results.then(results => chai_1.expect(results).to.be.lengthOf(10));
    });
    it('validates reserved words', () => {
        const results = Validator.validateText('constructor const prototype type typeof null undefined', 'javascript', __assign({}, defaultSettings, { maxNumberOfProblems: 10 }));
        return results.then(results => chai_1.expect(results).to.be.lengthOf(0));
    });
    it('validates regex inclusions/exclusions', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', defaultSettings);
        return results.then(results => {
            const words = results.map(wo => wo.word);
            chai_1.expect(words).to.contain('wrongg');
            chai_1.expect(words).to.contain('mispelled');
            chai_1.expect(words).to.not.contain('xaccd');
            chai_1.expect(words).to.not.contain('ctrip');
            chai_1.expect(words).to.not.contain('FFEE');
            chai_1.expect(words).to.not.contain('nmove');
        });
    });
    it('validates ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', { ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.word);
            chai_1.expect(words).to.not.contain('wrongg');
            chai_1.expect(words).to.not.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
    it('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] });
        return results.then(results => {
            const words = results.map(wo => wo.word);
            chai_1.expect(words).to.not.contain('wrongg');
            chai_1.expect(words).to.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
    it('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, 'plaintext', { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.word);
            chai_1.expect(words).to.contain('wrongg');
            chai_1.expect(words).to.not.contain('mispelled');
            chai_1.expect(words).to.contain('mischecked');
        });
    });
});
const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

`;
//# sourceMappingURL=validator.test.js.map