'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngformat = vscode.commands.registerCommand('extension.ngFormat', function () {
    run_1.runNgCommand(['format'], true);
});
//# sourceMappingURL=format.js.map