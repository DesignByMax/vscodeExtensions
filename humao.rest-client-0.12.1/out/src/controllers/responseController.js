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
const responseStore_1 = require('../responseStore');
const persistUtility_1 = require('../persistUtility');
const telemetry_1 = require('../telemetry');
const Constants = require('../constants');
const fs = require('fs');
const path = require('path');
const os = require('os');
var cp = require('copy-paste');
class ResponseController {
    static save(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            telemetry_1.Telemetry.sendEvent('Response-Save');
            if (!uri) {
                return;
            }
            let response = responseStore_1.ResponseStore.get(uri.toString());
            if (response !== undefined) {
                let fullResponse = ResponseController.getFullResponseString(response);
                let filePath = path.join(ResponseController.responseSaveFolderPath, `Response-${Date.now()}.http`);
                try {
                    yield persistUtility_1.PersistUtility.createFileIfNotExists(filePath);
                    fs.writeFileSync(filePath, fullResponse);
                    vscode_1.window.showInformationMessage(`Saved to ${filePath}`, { title: 'Open' }, { title: 'Copy Path' }).then(function (btn) {
                        if (btn) {
                            if (btn.title === 'Open') {
                                vscode_1.workspace.openTextDocument(filePath).then(vscode_1.window.showTextDocument);
                            }
                            else if (btn.title === 'Copy Path') {
                                cp.copy(filePath);
                            }
                        }
                    });
                }
                catch (error) {
                    vscode_1.window.showErrorMessage(`Failed to save latest response to ${filePath}`);
                }
            }
        });
    }
    dispose() {
    }
    static getFullResponseString(response) {
        let statusLine = `HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage}${os.EOL}`;
        let headerString = '';
        for (var header in response.headers) {
            if (response.headers.hasOwnProperty(header)) {
                headerString += `${header}: ${response.headers[header]}${os.EOL}`;
            }
        }
        let body = '';
        if (response.body) {
            body = `${os.EOL}${response.body}`;
        }
        return `${statusLine}${headerString}${body}`;
    }
}
ResponseController.responseSaveFolderPath = path.join(os.homedir(), Constants.ExtensionFolderName, Constants.DefaultResponseDownloadFolderName);
exports.ResponseController = ResponseController;
//# sourceMappingURL=responseController.js.map