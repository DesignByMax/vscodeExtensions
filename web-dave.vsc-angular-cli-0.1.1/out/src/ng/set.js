'use strict';
var vscode = require('vscode');
var run_1 = require('./run');
exports.ngset = vscode.commands.registerCommand('extension.ngSet', function () {
    var param = ['set'];
    vscode.window.showInputBox({ placeHolder: 'name of Param' }).then(function (name) {
        // param.push(name);
        vscode.window.showInputBox({ placeHolder: 'value of' + name }).then(function (val) {
            var pair = name + "=" + val;
            param.push(pair);
            console.log(pair);
            console.log(param);
            run_1.runNgCommand(param, true);
        });
    });
});
//# sourceMappingURL=set.js.map