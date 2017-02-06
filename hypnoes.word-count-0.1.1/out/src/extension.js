'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode_1 = require('vscode');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wold-count" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var wordCounter = new WordCounter();
    var controller = new WordCounterController(wordCounter);
    var disposable = vscode_1.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        wordCounter.updateWordCounter();
    });
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
var WordCounter = (function () {
    function WordCounter() {
    }
    WordCounter.prototype.updateWordCounter = function () {
        if (!this._statusBarItem) {
            this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        }
        var editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        var doc = editor.document;
        if (doc.languageId === "markdown") {
            var wordCount = this._getWordCount(doc);
            this._statusBarItem.text = wordCount !== 1 ? wordCount + " Words" : '1 Word';
            this._statusBarItem.show();
            this._statusBarItem.hide();
        }
    };
    WordCounter.prototype._getWordCount = function (doc) {
        var docContent = doc.getText();
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var wordCount = 0;
        if (docContent != "") {
            wordCount = docContent.split(" ").length;
        }
        return wordCount;
    };
    WordCounter.prototype.dispose = function () {
        this._statusBarItem.dispose();
    };
    return WordCounter;
}());
var WordCounterController = (function () {
    function WordCounterController(wordCounter) {
        this._wordCounter = wordCounter;
        this._wordCounter.updateWordCounter();
        var subscriptions = [];
        vscode_1.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode_1.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        this._wordCounter.updateWordCounter();
        this._dispossable = vscode_1.Disposable.from.apply(vscode_1.Disposable, subscriptions);
    }
    WordCounterController.prototype.dispose = function () {
        this._dispossable.dispose();
    };
    WordCounterController.prototype._onEvent = function () {
        this._wordCounter.updateWordCounter();
    };
    return WordCounterController;
}());
//# sourceMappingURL=extension.js.map