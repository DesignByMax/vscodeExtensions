"use strict";
const os_1 = require('os');
class Selector {
    getSelectedText(editor) {
        if (!editor || !editor.document) {
            return null;
        }
        let selectedText;
        if (editor.selection.isEmpty) {
            selectedText = this.getDelimitedText(editor.document.getText(), editor.selection.active.line);
        }
        else {
            selectedText = editor.document.getText(editor.selection);
        }
        return selectedText;
    }
    getDelimitedText(fullText, currentLine) {
        let lines = fullText.split(/\r?\n/g);
        let delimiterLineNumbers = this.getDelimiterRows(lines);
        if (delimiterLineNumbers.length === 0) {
            return fullText;
        }
        // return null if cursor is in delimiter line
        if (delimiterLineNumbers.indexOf(currentLine) > -1) {
            return null;
        }
        if (currentLine < delimiterLineNumbers[0]) {
            return lines.slice(0, delimiterLineNumbers[0]).join(os_1.EOL);
        }
        if (currentLine > delimiterLineNumbers[delimiterLineNumbers.length - 1]) {
            return lines.slice(delimiterLineNumbers[delimiterLineNumbers.length - 1] + 1).join(os_1.EOL);
        }
        for (var index = 0; index < delimiterLineNumbers.length - 1; index++) {
            let start = delimiterLineNumbers[index];
            let end = delimiterLineNumbers[index + 1];
            if (start < currentLine && currentLine < end) {
                return lines.slice(start + 1, end).join(os_1.EOL);
            }
        }
    }
    getDelimiterRows(lines) {
        let rows = [];
        for (var index = 0; index < lines.length; index++) {
            if (lines[index].match(/^#{3,}/)) {
                rows.push(index);
            }
        }
        return rows;
    }
}
exports.Selector = Selector;
//# sourceMappingURL=selector.js.map