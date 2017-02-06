'use strict';
var vscode = require('vscode');
var cp = require('child_process');
exports.ngget = vscode.commands.registerCommand('extension.ngGet', function () {
    vscode.window.showInputBox({ placeHolder: 'name of the Parameter' }).then(function (name) {
        var child = cp.exec('ng get ' + name);
        child.stdout.on('data', function (data) {
            console.log('data', data);
            vscode.window.showInformationMessage(data);
        });
    });
});
//# sourceMappingURL=get.js.map