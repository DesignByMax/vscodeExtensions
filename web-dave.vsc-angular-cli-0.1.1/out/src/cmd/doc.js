'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngdoc = vscode.commands.registerCommand('extension.ngDoc', function () {
    vscode.window.showInputBox({ placeHolder: 'search for' }).then(function (data) {
        run_1.runNgCommand(['doc', data], false);
    });
});
//# sourceMappingURL=doc.js.map