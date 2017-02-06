'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.nghelp = vscode.commands.registerCommand('extension.ngHelp', function () {
    var param = ['help'];
    run_1.runNgCommand(param, true);
});
//# sourceMappingURL=help.js.map