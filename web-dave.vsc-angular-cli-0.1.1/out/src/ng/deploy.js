'use strict';
var vscode = require('vscode');
var cp = require('child_process');
exports.ngdeploy = vscode.commands.registerCommand('extension.ngDeploy', function () {
    var child = cp.exec('ng github-pages:deploy');
    child.stdout.on('data', function (data) {
        vscode.window.showInformationMessage(data);
    });
});
//# sourceMappingURL=deploy.js.map