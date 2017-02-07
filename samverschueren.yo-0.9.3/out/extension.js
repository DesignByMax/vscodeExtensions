'use strict';
const vscode_1 = require('vscode');
const EscapeException_1 = require('./utils/EscapeException');
const yo_1 = require('./yo/yo');
const path = require('path');
const fs = require('fs');
const figures = require('figures');
const opn = require('opn');
function activate(context) {
    const cwd = vscode_1.workspace.rootPath;
    const disposable = vscode_1.commands.registerCommand('yo', () => {
        if (!cwd) {
            vscode_1.window.showErrorMessage('Please open a workspace directory first.');
            return;
        }
        const yo = new yo_1.default({ cwd });
        let main;
        let sub;
        Promise.resolve(vscode_1.window.showQuickPick(list(yo)))
            .then((generator) => {
            if (generator === undefined) {
                throw new EscapeException_1.default();
            }
            main = generator.label;
            if (generator.subGenerators.length > 1) {
                return runSubGenerators(generator.subGenerators);
            }
            else {
                return 'app';
            }
        })
            .then(subGenerator => {
            if (subGenerator === undefined) {
                throw new EscapeException_1.default();
            }
            sub = subGenerator;
            return yo.run(`${main}:${sub}`, cwd);
        })
            .catch(err => {
            const regexp = new RegExp('Did not provide required argument (.*?)!', 'i');
            if (err) {
                const match = err.message.match(regexp);
                if (match) {
                    return `${sub} ${match[1]}?`;
                }
            }
            throw err;
        })
            .then((question) => {
            return vscode_1.window.showInputBox({ prompt: question })
                .then(input => {
                if (!input) {
                    throw new EscapeException_1.default();
                }
                return input;
            });
        })
            .then(argument => {
            return yo.run(`${main}:${sub} ${argument}`, cwd);
        })
            .catch(err => {
            if (!err || err instanceof EscapeException_1.default) {
                return;
            }
            vscode_1.window.showErrorMessage(err.message || err);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function runSubGenerators(subGenerators) {
    const app = `${figures.star} app`;
    const index = subGenerators.indexOf('app');
    if (index !== -1) {
        subGenerators.splice(index, 1);
        subGenerators.unshift(app);
    }
    return vscode_1.window.showQuickPick(subGenerators)
        .then(choice => {
        if (choice === app) {
            return 'app';
        }
        return choice;
    });
}
function list(yo) {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            yo.getEnvironment().lookup(() => {
                const generators = yo.getGenerators().map(generator => {
                    return {
                        label: generator.name.replace(/(^|\/)generator\-/i, '$1'),
                        description: generator.description,
                        subGenerators: generator.subGenerators
                    };
                });
                if (generators.length === 0) {
                    reject();
                    vscode_1.window.showInformationMessage('Make sure to install some generators first.', 'more info')
                        .then(choice => {
                        if (choice === 'more info') {
                            opn('http://yeoman.io/learning/');
                        }
                    });
                    return;
                }
                resolve(generators);
            });
        });
    });
}
//# sourceMappingURL=extension.js.map