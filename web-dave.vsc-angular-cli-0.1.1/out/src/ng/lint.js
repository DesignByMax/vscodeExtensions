'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.nglint = vscode.commands.registerCommand('extension.ngLint', function () {
    run_1.runNgCommand(['lint'], true);
});
//# sourceMappingURL=lint.js.map