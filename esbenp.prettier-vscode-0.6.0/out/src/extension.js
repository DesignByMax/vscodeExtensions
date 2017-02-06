'use strict';
const vscode_1 = require("vscode");
const prettier = require('prettier');
function activate(context) {
    const eventDisposable = vscode_1.workspace.onWillSaveTextDocument(e => {
        const document = e.document;
        if (!document.isDirty) {
            return;
        }
        const config = vscode_1.workspace.getConfiguration('prettier');
        const formatOnSave = config.formatOnSave;
        if (!formatOnSave) {
            return;
        }
        e.waitUntil(new Promise(resolve => {
            const prettified = format(document, null);
            const rangeObj = createFullDocumentRange(document);
            const edit = vscode_1.TextEdit.replace(rangeObj, prettified);
            resolve([edit]);
        }));
    });
    const disposable = vscode_1.commands.registerCommand('prettier.format', () => {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        let selectionOrRange = editor.selection;
        if (selectionOrRange.isEmpty) {
            selectionOrRange = createFullDocumentRange(document);
        }
        const prettified = format(document, selectionOrRange);
        editor.edit((editBuilder) => {
            const rangeObj = new vscode_1.Range(selectionOrRange.start.line, selectionOrRange.start.character, selectionOrRange.end.line, selectionOrRange.end.character);
            editBuilder.replace(rangeObj, prettified);
        });
    });
    context.subscriptions.push(eventDisposable);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
const createFullDocumentRange = document => new vscode_1.Range(0, 0, document.lineCount, 0);
const format = (document, selection = null) => {
    const text = document.getText(selection);
    const config = vscode_1.workspace.getConfiguration('prettier');
    try {
        var transformed = prettier.format(text, {
            printWidth: config.printWidth,
            tabWidth: config.tabWidth,
            useFlowParser: config.useFlowParser,
            singleQuote: config.singleQuote,
            trailingComma: config.trailingComma,
            bracketSpacing: config.bracketSpacing
        });
    }
    catch (e) {
        console.log("Error transforming using prettier:", e);
        transformed = text;
    }
    return transformed;
};
//# sourceMappingURL=extension.js.map