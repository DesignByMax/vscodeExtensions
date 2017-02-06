'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngcompletion = vscode.commands.registerCommand('extension.ngCompletion', function () {
    run_1.runNgCommand(['completion'], false);
});
//# sourceMappingURL=completion.js.map