"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode_1 = require('vscode');
const requestParserFactory_1 = require('../models/requestParserFactory');
const variableProcessor_1 = require('../variableProcessor');
const harHttpRequest_1 = require('../models/harHttpRequest');
const codeSnippetTargetPickItem_1 = require('../models/codeSnippetTargetPickItem');
const codeSnippetTarget_1 = require('../models/codeSnippetTarget');
const codeSnippetClientPickItem_1 = require('../models/codeSnippetClientPickItem');
const codeSnippetClient_1 = require('../models/codeSnippetClient');
const codeSnippetTextDocumentContentProvider_1 = require('../views/codeSnippetTextDocumentContentProvider');
const selector_1 = require('../selector');
const telemetry_1 = require('../telemetry');
const Constants = require('../constants');
const os_1 = require('os');
const cp = require('copy-paste');
const HTTPSnippet = require('httpsnippet');
class CodeSnippetController {
    constructor() {
        this._previewUri = vscode_1.Uri.parse('rest-code-snippet://authority/generate-code-snippet');
        this._codeSnippetTextProvider = new codeSnippetTextDocumentContentProvider_1.CodeSnippetTextDocumentContentProvider(null, null);
        this._registration = vscode_1.workspace.registerTextDocumentContentProvider('rest-code-snippet', this._codeSnippetTextProvider);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let editor = vscode_1.window.activeTextEditor;
            if (!editor || !editor.document) {
                return;
            }
            // Get selected text of selected lines or full document
            let selectedText = new selector_1.Selector().getSelectedText(editor);
            if (!selectedText) {
                return;
            }
            // remove comment lines
            let lines = selectedText.split(/\r?\n/g);
            selectedText = lines.filter(l => !Constants.CommentIdentifiersRegex.test(l)).join(os_1.EOL);
            if (selectedText === '') {
                return;
            }
            // variables replacement
            selectedText = yield variableProcessor_1.VariableProcessor.processRawRequest(selectedText);
            this._selectedText = selectedText;
            // parse http request
            let httpRequest = new requestParserFactory_1.RequestParserFactory().createRequestParser(selectedText).parseHttpRequest(selectedText, editor.document.fileName);
            if (!httpRequest) {
                return;
            }
            let harHttpRequest = this.convertToHARHttpRequest(httpRequest);
            let snippet = new HTTPSnippet(harHttpRequest);
            if (CodeSnippetController._availableTargets) {
                let targetsPickList = CodeSnippetController._availableTargets.map(target => {
                    let item = new codeSnippetTargetPickItem_1.CodeSnippetTargetQuickPickItem();
                    item.label = target.title;
                    item.rawTarget = new codeSnippetTarget_1.CodeSnippetTarget();
                    item.rawTarget.default = target.default;
                    item.rawTarget.extname = target.extname;
                    item.rawTarget.key = target.key;
                    item.rawTarget.title = target.title;
                    item.rawTarget.clients = target.clients.map(client => {
                        let clientItem = new codeSnippetClient_1.CodeSnippetClient();
                        clientItem.key = client.key;
                        clientItem.link = client.link;
                        clientItem.title = client.title;
                        clientItem.description = client.description;
                        return clientItem;
                    });
                    return item;
                });
                let item = yield vscode_1.window.showQuickPick(targetsPickList, { placeHolder: "" });
                if (!item) {
                    return;
                }
                else {
                    let clientsPickList = item.rawTarget.clients.map(client => {
                        let item = new codeSnippetClientPickItem_1.CodeSnippetClientQuickPickItem();
                        item.label = client.title;
                        item.description = client.description;
                        item.detail = client.link;
                        item.rawClient = client;
                        return item;
                    });
                    let client = yield vscode_1.window.showQuickPick(clientsPickList, { placeHolder: "" });
                    if (client) {
                        telemetry_1.Telemetry.sendEvent('Generate Code Snippet', { 'target': item.rawTarget.key, 'client': client.rawClient.key });
                        let result = snippet.convert(item.rawTarget.key, client.rawClient.key);
                        this._convertedResult = result;
                        this._codeSnippetTextProvider.convertResult = result;
                        this._codeSnippetTextProvider.lang = item.rawTarget.key;
                        this._codeSnippetTextProvider.update(this._previewUri);
                        try {
                            yield vscode_1.commands.executeCommand('vscode.previewHtml', this._previewUri, vscode_1.ViewColumn.Two, `${item.rawTarget.title}-${client.rawClient.title}`);
                        }
                        catch (reason) {
                            vscode_1.window.showErrorMessage(reason);
                        }
                    }
                }
            }
            else {
                vscode_1.window.showInformationMessage('No available code snippet convert targets');
            }
        });
    }
    copy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._convertedResult) {
                cp.copy(this._convertedResult);
            }
        });
    }
    convertToHARHttpRequest(request) {
        // convert headers
        let headers = [];
        for (var key in request.headers) {
            headers.push(new harHttpRequest_1.HARHeader(key, request.headers[key]));
        }
        // convert cookie headers
        let cookies = [];
        let cookieHeader = headers.find(header => header.name.toLowerCase() === 'cookie');
        if (cookieHeader) {
            cookieHeader.value.split(';').forEach(pair => {
                let cookieParts = pair.split('=', 2);
                if (cookieParts.length === 2) {
                    cookies.push(new harHttpRequest_1.HARCookie(cookieParts[0].trim(), cookieParts[1].trim()));
                }
                else {
                    cookies.push(new harHttpRequest_1.HARCookie(cookieParts[0].trim(), ''));
                }
            });
        }
        // convert body
        let body = null;
        if (request.body) {
            let contentTypeHeader = headers.find(header => header.name.toLowerCase() === 'content-type');
            let mimeType;
            if (contentTypeHeader) {
                mimeType = contentTypeHeader.value;
            }
            body = new harHttpRequest_1.HARPostData(mimeType, request.body);
        }
        return new harHttpRequest_1.HARHttpRequest(request.method, request.url, headers, cookies, body);
    }
    dispose() {
    }
}
CodeSnippetController._availableTargets = HTTPSnippet.availableTargets();
exports.CodeSnippetController = CodeSnippetController;
//# sourceMappingURL=codeSnippetController.js.map