'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.nginit = vscode.commands.registerCommand('extension.ngInit', function () {
    var project = vscode.window.showInputBox({ placeHolder: 'any options?' }).then(function (data) {
        run_1.runNgCommand(['init', data], true);
    });
});
//# sourceMappingURL=init.js.map