'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngserve = vscode.commands.registerCommand('extension.ngServe', function () {
    run_1.runNgCommand(['serve'], true);
});
//# sourceMappingURL=serve.js.map