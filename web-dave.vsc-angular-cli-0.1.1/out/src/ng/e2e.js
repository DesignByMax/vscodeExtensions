'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.nge2e = vscode.commands.registerCommand('extension.ngE2e', function () {
    run_1.runNgCommand(['e2e'], true);
});
//# sourceMappingURL=e2e.js.map