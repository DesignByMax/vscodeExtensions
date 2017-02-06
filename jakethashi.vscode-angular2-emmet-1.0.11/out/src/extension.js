'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var emmetActions_1 = require('./emmetActions');
function activate(context) {
    var emmetActions;
    var disposable = vscode.commands.registerCommand('extension.emmetMe', function () {
        try {
            emmetActions = new emmetActions_1.EmmetActions(vscode.window.activeTextEditor);
            emmetActions.emmetMe();
        }
        catch (e) { }
    });
    context.subscriptions.push(emmetActions);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map