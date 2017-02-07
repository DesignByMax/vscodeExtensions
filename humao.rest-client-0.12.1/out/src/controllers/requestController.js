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
const httpClient_1 = require('../httpClient');
const configurationSettings_1 = require('../models/configurationSettings');
const persistUtility_1 = require('../persistUtility');
const httpResponseTextDocumentContentProvider_1 = require('../views/httpResponseTextDocumentContentProvider');
const telemetry_1 = require('../telemetry');
const variableProcessor_1 = require('../variableProcessor');
const requestStore_1 = require('../requestStore');
const responseStore_1 = require('../responseStore');
const selector_1 = require('../selector');
const Constants = require('../constants');
const os_1 = require('os');
const elegantSpinner = require('elegant-spinner');
const spinner = elegantSpinner();
const filesize = require('filesize');
const uuid = require('node-uuid');
class RequestController {
    constructor() {
        this._previewUri = vscode_1.Uri.parse('rest-response://authority/response-preview');
        this._durationStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this._sizeStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this._restClientSettings = new configurationSettings_1.RestClientSettings();
        this._httpClient = new httpClient_1.HttpClient(this._restClientSettings);
        this._responseTextProvider = new httpResponseTextDocumentContentProvider_1.HttpResponseTextDocumentContentProvider(null, this._restClientSettings);
        this._registration = vscode_1.workspace.registerTextDocumentContentProvider('rest-response', this._responseTextProvider);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            telemetry_1.Telemetry.sendEvent('Request');
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
            // parse http request
            let httpRequest = new requestParserFactory_1.RequestParserFactory().createRequestParser(selectedText).parseHttpRequest(selectedText, editor.document.fileName);
            if (!httpRequest) {
                return;
            }
            yield this.runCore(httpRequest);
        });
    }
    rerun() {
        return __awaiter(this, void 0, void 0, function* () {
            telemetry_1.Telemetry.sendEvent('Rerun Request');
            let httpRequest = requestStore_1.RequestStore.getLatest();
            if (!httpRequest) {
                return;
            }
            yield this.runCore(httpRequest);
        });
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            telemetry_1.Telemetry.sendEvent('Cancel Request');
            if (requestStore_1.RequestStore.isCompleted()) {
                return;
            }
            this.clearSendProgressStatusText();
            // cancel current request
            requestStore_1.RequestStore.cancel();
            this._durationStatusBarItem.command = null;
            this._durationStatusBarItem.text = 'Cancelled $(circle-slash)';
            this._durationStatusBarItem.tooltip = null;
        });
    }
    runCore(httpRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestId = uuid.v4();
            requestStore_1.RequestStore.add(requestId, httpRequest);
            // clear status bar
            this.setSendingProgressStatusText();
            // set http request
            try {
                let response = yield this._httpClient.send(httpRequest);
                // check cancel
                if (requestStore_1.RequestStore.isCancelled(requestId)) {
                    return;
                }
                this.clearSendProgressStatusText();
                this._durationStatusBarItem.command = null;
                this._durationStatusBarItem.text = ` $(clock) ${response.elapsedMillionSeconds}ms`;
                this._durationStatusBarItem.tooltip = 'Duration';
                this._sizeStatusBarItem.text = ` $(database) ${filesize(response.bodySizeInBytes)}`;
                this._sizeStatusBarItem.tooltip = 'Body Size';
                this._sizeStatusBarItem.show();
                this._responseTextProvider.response = response;
                this._responseTextProvider.update(this._previewUri);
                let previewUri = this.generatePreviewUri();
                responseStore_1.ResponseStore.add(previewUri.toString(), response);
                try {
                    yield vscode_1.commands.executeCommand('vscode.previewHtml', previewUri, vscode_1.ViewColumn.Two, `Response(${response.elapsedMillionSeconds}ms)`);
                }
                catch (reason) {
                    vscode_1.window.showErrorMessage(reason);
                }
                // persist to history json file
                let serializedRequest = httpRequest;
                serializedRequest.startTime = Date.now();
                yield persistUtility_1.PersistUtility.saveRequest(serializedRequest);
            }
            catch (error) {
                // check cancel
                if (requestStore_1.RequestStore.isCancelled(requestId)) {
                    return;
                }
                if (error.code === 'ETIMEDOUT') {
                    error.message = `Please check your networking connectivity and your time out in ${this._restClientSettings.timeoutInMilliseconds}ms according to your configuration 'rest-client.timeoutinmilliseconds'. Details: ${error}. `;
                }
                else if (error.code === 'ECONNREFUSED') {
                    error.message = `Connection is being rejected. The service isn’t running on the server, or a firewall is blocking requests. Details: ${error}.`;
                }
                else if (error.code === 'ENETUNREACH') {
                    error.message = `You don't seem to be connected to a network. Details: ${error}`;
                }
                this.clearSendProgressStatusText();
                this._durationStatusBarItem.command = null;
                this._durationStatusBarItem.text = '';
                vscode_1.window.showErrorMessage(error.message);
            }
            finally {
                requestStore_1.RequestStore.complete(requestId);
            }
        });
    }
    dispose() {
        this._durationStatusBarItem.dispose();
        this._sizeStatusBarItem.dispose();
        this._registration.dispose();
    }
    generatePreviewUri() {
        let uriString = 'rest-response://authority/response-preview';
        if (this._restClientSettings.showResponseInDifferentTab) {
            uriString += `/${Date.now()}`; // just make every uri different
        }
        return vscode_1.Uri.parse(uriString);
    }
    setSendingProgressStatusText() {
        this.clearSendProgressStatusText();
        this._interval = setInterval(() => {
            this._durationStatusBarItem.text = `Waiting ${spinner()}`;
        }, 50);
        this._durationStatusBarItem.tooltip = 'Waiting Response';
        this._durationStatusBarItem.show();
    }
    clearSendProgressStatusText() {
        clearInterval(this._interval);
        this._sizeStatusBarItem.hide();
    }
}
exports.RequestController = RequestController;
//# sourceMappingURL=requestController.js.map