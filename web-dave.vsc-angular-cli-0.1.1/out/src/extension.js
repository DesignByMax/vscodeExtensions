'use strict';
var vscode = require('vscode');
var new_1 = require('./ng/new');
var init_1 = require('./ng/init');
var version_1 = require('./ng/version');
var serve_1 = require('./ng/serve');
var doc_1 = require('./ng/doc');
var lint_1 = require('./ng/lint');
var completion_1 = require('./ng/completion');
var e2e_1 = require('./ng/e2e');
var format_1 = require('./ng/format');
var test_1 = require('./ng/test');
var generate_1 = require('./ng/generate');
var help_1 = require('./ng/help');
// import { ngset } from './ng/set';
// import { ngdeploy } from './ng/deploy';
// import { ngget } from './ng/get';
var outputChannel;
function activate(context) {
    registerCommands(context);
    outputChannel = vscode.window.createOutputChannel('ng');
    context.subscriptions.push(outputChannel);
}
exports.activate = activate;
function registerCommands(context) {
    context.subscriptions.push(new_1.ngnew);
    context.subscriptions.push(init_1.nginit);
    context.subscriptions.push(version_1.ngversion);
    context.subscriptions.push(serve_1.ngserve);
    context.subscriptions.push(doc_1.ngdoc);
    context.subscriptions.push(lint_1.nglint);
    context.subscriptions.push(format_1.ngformat);
    context.subscriptions.push(e2e_1.nge2e);
    context.subscriptions.push(completion_1.ngcompletion);
    context.subscriptions.push(generate_1.nggenerate);
    context.subscriptions.push(test_1.ngtest);
    context.subscriptions.push(help_1.nghelp);
    // context.subscriptions.push(ngset);
    // context.subscriptions.push(ngget);
    // context.subscriptions.push(ngdeploy);
}
//# sourceMappingURL=extension.js.map