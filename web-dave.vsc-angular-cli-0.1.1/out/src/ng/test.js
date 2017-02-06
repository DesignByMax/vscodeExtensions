'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngtest = vscode.commands.registerCommand('extension.ngTest', function () {
    run_1.runNgCommand(['test'], false);
});
//# sourceMappingURL=test.js.map