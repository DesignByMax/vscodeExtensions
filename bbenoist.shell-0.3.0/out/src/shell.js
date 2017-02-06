'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require('events');
var path = require('path');
var vscode = require('vscode');
var Collections = require('typescript-collections');
var spawnCommand = require('spawn-command');
var treeKill = require('tree-kill');
var ShellCommand = (function (_super) {
    __extends(ShellCommand, _super);
    function ShellCommand(cmd, cwd) {
        _super.call(this);
        this.cmd = cmd;
        this.cwd = cwd;
    }
    ShellCommand.prototype.run = function () {
        var _this = this;
        return new Promise(function (accept, reject) {
            _this.process = spawnCommand(_this.cmd, _this.cwd ? { cwd: _this.cwd } : {});
            _this.emit('out', _this.process.pid + "> Starting command `" + _this.cmd + "`...");
            var emitOut = function (data) { _this.emit('out', _this.process.pid + ": " + data); };
            process.stdout.on('data', emitOut);
            process.stderr.on('data', emitOut);
            process.on('close', function (status) {
                _this.emit('out', _this.process.pid + "> Command `" + _this.cmd + "` exited with status code " + status + ".");
                accept(status);
            });
        });
    };
    ShellCommand.prototype.terminate = function () {
        var _this = this;
        return new Promise(function (accept, reject) {
            treeKill(_this.process.pid, 'SIGTERM', function (err) {
                if (err) {
                    reject("err.toString()");
                }
                else {
                    accept();
                }
            });
        });
    };
    return ShellCommand;
}(events.EventEmitter));
exports.ShellCommand = ShellCommand;
var ShellManager = (function (_super) {
    __extends(ShellManager, _super);
    function ShellManager() {
        _super.call(this);
        this.history = new Collections.Queue();
        this.outputChannel = vscode.window.createOutputChannel("Shell");
    }
    ShellManager.prototype.dispose = function () {
    };
    ShellManager.prototype.newCommand = function (cmd, cwd) {
        if (!cwd && vscode.workspace) {
            cwd = vscode.workspace.rootPath;
        }
        var shellCMD = new ShellCommand(cmd, cwd);
        // Drop old commands if history is too large.
        while (this.history.size() > 99) {
            this.history.dequeue();
        }
        this.history.enqueue(shellCMD);
        return shellCMD;
    };
    ShellManager.prototype.runCommand = function (cmd, cwd) {
        var _this = this;
        return new Promise(function (accept, reject) {
            var shellCMD = _this.newCommand(cmd, cwd);
            shellCMD.on('out', function (txt) { _this.outputChannel.append(txt); });
            shellCMD.run().then(function (status) {
                if (status) {
                    reject("Shell command `" + cmd + "` exited with status code " + status + ".");
                }
                else {
                    accept();
                }
            });
        });
    };
    ShellManager.prototype.runCommandAtFileLocation = function (cmd) {
        var _this = this;
        return new Promise(function (accept, reject) {
            if (vscode.window.activeTextEditor.document.uri.scheme !== 'file') {
                reject('Current document is not a local file.');
                return;
            }
            var location = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
            _this.runCommand(cmd, location).then(accept, reject);
        });
    };
    ShellManager.prototype.typeCommand = function (cwd) {
        var _this = this;
        return new Promise(function (accept, reject) {
            var options = {
                placeHolder: 'Type your command here'
            };
            var historyStr = [];
            _this.history.forEach(function (shellCommand) { historyStr.push(shellCommand.cmd); });
            vscode.window.showQuickPick(historyStr).then(function (value) {
                if (value) {
                    accept(value);
                }
                else {
                    reject();
                }
            }, reject);
        });
    };
    ShellManager.prototype.typeThenRunCommand = function (runPromiseFactory) {
        var _this = this;
        return new Promise(function (accept, reject) {
            _this.typeCommand().then(runPromiseFactory).catch(function (reason) {
                if (reason) {
                    vscode.window.showErrorMessage(reason);
                }
            });
        });
    };
    ShellManager.prototype.onRunCommand = function () {
        var _this = this;
        return new Promise(function (accept, reject) {
            _this.typeThenRunCommand(_this.runCommand);
        });
    };
    ShellManager.prototype.onRunCommandAtFileLocation = function () {
        var _this = this;
        return new Promise(function (accept, reject) {
            _this.typeThenRunCommand(_this.runCommandAtFileLocation);
        });
    };
    return ShellManager;
}(events.EventEmitter));
exports.ShellManager = ShellManager;
//# sourceMappingURL=shell.js.map