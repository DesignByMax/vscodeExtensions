'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode_1 = require('vscode');
const environmentController_1 = require('./controllers/environmentController');
class CustomVariableHoverProvider {
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let wordRange = document.getWordRangeAtPosition(position);
            let lineRange = document.lineAt(position);
            if (!wordRange
                || wordRange.start.character < 2
                || wordRange.end.character > lineRange.range.end.character - 1
                || lineRange.text[wordRange.start.character - 1] !== '{'
                || lineRange.text[wordRange.start.character - 2] !== '{'
                || lineRange.text[wordRange.end.character] !== '}'
                || lineRange.text[wordRange.end.character + 1] !== '}') {
                // not a custom variable syntax
                return;
            }
            let selectedVariableName = document.getText(wordRange);
            let customVariables = yield environmentController_1.EnvironmentController.getCustomVariables();
            for (var variableName in customVariables) {
                if (variableName === selectedVariableName) {
                    let contents = [customVariables[variableName], { language: 'http', value: `Custom Variable ${variableName}` }];
                    return new vscode_1.Hover(contents, wordRange);
                }
            }
            return;
        });
    }
}
exports.CustomVariableHoverProvider = CustomVariableHoverProvider;
//# sourceMappingURL=customVariableHoverProvider.js.map