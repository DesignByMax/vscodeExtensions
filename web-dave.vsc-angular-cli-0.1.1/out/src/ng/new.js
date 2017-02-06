'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngnew = vscode.commands.registerCommand('extension.ngNew', function () {
    var project = vscode.window.showInputBox({ placeHolder: 'name of your project' }).then(function (data) {
        run_1.runNgCommand(['new', data], true);
    });
});
//# sourceMappingURL=new.js.map