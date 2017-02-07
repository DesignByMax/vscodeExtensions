"use strict";
const input_1 = require('./input');
class PasswordPrompt extends input_1.default {
    constructor(question, answers) {
        super(question, answers);
        this._options.password = true;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PasswordPrompt;
//# sourceMappingURL=password.js.map