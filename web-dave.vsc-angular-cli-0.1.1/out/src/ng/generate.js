'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.nggenerate = vscode.commands.registerCommand('extension.ngGenerate', function () {
    var param = ['generate'];
    var items = ['component', 'directive', 'route', 'pipe', 'service'];
    var options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(function (data) {
        param.push(data);
        vscode.window.showInputBox({ placeHolder: 'name of the ' + data }).then(function (name) {
            param.push(name);
            run_1.runNgCommand(param, true);
        });
    });
});
//# sourceMappingURL=generate.js.map