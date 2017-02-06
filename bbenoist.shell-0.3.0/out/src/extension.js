'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var spawnCMD = require('spawn-command');
var treeKill = require('tree-kill');
var history = require('./history');
var process = null;
var commandOutput = null;
var commandHistory = null;
function run(cmd, cwd) {
    return new Promise(function (accept, reject) {
        var opts = {};
        if (vscode.workspace) {
            opts.cwd = cwd;
        }
        process = spawnCMD(cmd, opts);
        function printOutput(data) { commandOutput.append(data.toString()); }
        process.stdout.on('data', printOutput);
        process.stderr.on('data', printOutput);
        process.on('close', function (status) {
            if (status) {
                reject("Command `" + cmd + "` exited with status code " + status + ".");
            }
            else {
                accept();
            }
            process = null;
        });
    });
}
function term() {
    treeKill(process.pid, 'SIGTERM', function (err) {
        if (err) {
            vscode.window.showErrorMessage("Failed to kill process with PID " + process.pid + ".");
        }
        else {
            process = null;
        }
    });
}
function exec(cmd, cwd) {
    if (!cmd) {
        return;
    }
    commandHistory.enqueue(cmd, cwd);
    commandOutput.clear();
    commandOutput.appendLine("> Running command `" + cmd + "`...");
    run(cmd, cwd).then(function () {
        commandOutput.appendLine("> Command `" + cmd + "` ran successfully.");
    }).catch(function (reason) {
        commandOutput.appendLine("> ERROR: " + reason);
        vscode.window.showErrorMessage(reason, 'Show Output')
            .then(function (action) { commandOutput.show(); });
    });
}
function execShellCMD(cwd) {
    if (process) {
        var msg = 'There is an active running shell command right now. Terminate it before executing another shell command.';
        vscode.window.showWarningMessage(msg, 'Terminate')
            .then(function (choice) {
            if (choice === 'Terminate') {
                term();
            }
        });
    }
    else {
        var lastCmd = commandHistory.last();
        var options = {
            placeHolder: 'Type your shell command here.',
            value: lastCmd ? lastCmd.cmd : undefined
        };
        vscode.window.showInputBox(options).then(function (cmd) {
            exec(cmd, cwd);
        });
    }
}
function showHistory() {
    return new Promise(function (accept, reject) {
        var items = commandHistory.commands().map(function (cmd) {
            return { label: cmd.cmd, detail: cmd.cwd, cmd: cmd, description: undefined };
        });
        vscode.window.showQuickPick(items).then(function (value) {
            if (value) {
                exec(value.cmd.cmd, value.cmd.cwd);
            }
        });
    });
}
function activate(context) {
    commandHistory = new history.CommandHistory();
    context.subscriptions.push(commandHistory);
    commandOutput = vscode.window.createOutputChannel('Shell');
    context.subscriptions.push(commandOutput);
    var shellCMD = vscode.commands.registerCommand('shell.runCommand', function () {
        execShellCMD(vscode.workspace.rootPath);
    });
    context.subscriptions.push(shellCMD);
    var cwdShellCMD = vscode.commands.registerTextEditorCommand('shell.runCommandAtFileLocation', function () {
        if (vscode.window.activeTextEditor.document.uri.scheme !== 'file') {
            vscode.window.showErrorMessage('Current document is not a local file.');
        }
        else {
            execShellCMD(path.dirname(vscode.window.activeTextEditor.document.uri.fsPath));
        }
    });
    context.subscriptions.push(cwdShellCMD);
    var shellHistory = vscode.commands.registerCommand('shell.showHistory', showHistory);
    context.subscriptions.push(shellHistory);
    var shellTerm = vscode.commands.registerCommand('shell.terminateCommand', function () {
        if (process) {
            term();
        }
        else {
            vscode.window.showErrorMessage('No running command.');
        }
    });
    context.subscriptions.push(shellTerm);
    var shellOutput = vscode.commands.registerCommand('shell.showCommandLog', function () {
        commandOutput.show();
    });
    context.subscriptions.push(shellOutput);
}
exports.activate = activate;
function deactivate() {
    if (process) {
        treeKill(process.pid, 'SIGTERM', function (err) {
            if (err) {
                treeKill(process.pid, 'SIGKILL');
            }
            process = null;
        });
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map