'use strict';
var vscode = require('vscode');
var cp = require('child_process');
var run_in_terminal_1 = require('run-in-terminal');
var outputChannel;
function runNgCommand(args, useTerminal) {
    var cwd = vscode.workspace.rootPath;
    if (useTerminal) {
        runCommandInTerminal(args, cwd);
    }
    else {
        runCommandInOutputWindow(args, cwd);
    }
}
exports.runNgCommand = runNgCommand;
function showOutput() {
    outputChannel.show(vscode.ViewColumn.Three);
}
function runCommandInTerminal(args, cwd) {
    run_in_terminal_1.runInTerminal('ng', args, { cwd: cwd, env: process.env });
}
function runCommandInOutputWindow(args, cwd) {
    var cmd = 'ng ' + args.join(' ');
    var p = cp.exec(cmd, { cwd: cwd, env: process.env });
    p.stderr.on('data', function (data) {
        outputChannel.append(data);
    });
    p.stdout.on('data', function (data) {
        outputChannel.append(data);
    });
    showOutput();
}
//# sourceMappingURL=run.js.map