'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngversion = vscode.commands.registerCommand('extension.ngVersion', function () {
    run_1.runNgCommand(['version'], true);
});
//# sourceMappingURL=version.js.map