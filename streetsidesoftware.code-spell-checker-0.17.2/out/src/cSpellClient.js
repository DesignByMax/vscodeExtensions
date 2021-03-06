"use strict";
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode = require("vscode");
const Settings = require("./settings");
const LanguageIds = require("./languageIds");
const util_1 = require("./util");
// The debug options for the server
const debugOptions = { execArgv: ['--nolazy', '--debug=60048'] };
class CSpellClient {
    /**
     * @param: {string} module -- absolute path to the server module.
     */
    constructor(module, languageIds) {
        const enabledLanguageIds = Settings.getSettingFromConfig('enabledLanguageIds');
        const documentSelector = util_1.unique(languageIds.concat(enabledLanguageIds).concat(LanguageIds.languageIds));
        // Options to control the language client
        const clientOptions = {
            documentSelector,
            diagnosticCollectionName: 'cSpell Checker',
            synchronize: {
                // Synchronize the setting section 'spellChecker' to the server
                configurationSection: ['cSpell', 'search']
            }
        };
        // If the extension is launched in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions = {
            run: { module, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: { module, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
        };
        // Create the language client and start the client.
        this.client = new vscode_languageclient_1.LanguageClient('Code Spell Checker', serverOptions, clientOptions);
    }
    needsStart() {
        return this.client.needsStart();
    }
    needsStop() {
        return this.client.needsStop();
    }
    start() {
        return this.client.start();
    }
    isSpellCheckEnabled(document) {
        const { uri, languageId = '' } = document;
        if (!uri || !languageId) {
            return Promise.resolve({});
        }
        return this.client.onReady().then(() => this.client.sendRequest('isSpellCheckEnabled', { uri: uri.toString(), languageId }))
            .then((response) => response);
    }
    applySettings(settings) {
        return this.client.onReady().then(() => this.client.sendNotification('applySettings', { settings }));
    }
    get diagnostics() {
        return this.client.diagnostics;
    }
    triggerSettingsRefresh() {
        const workspaceConfig = vscode.workspace.getConfiguration();
        const cSpell = workspaceConfig.get('cSpell');
        const search = workspaceConfig.get('search');
        this.applySettings({ cSpell, search });
    }
    static create(module) {
        return vscode.languages.getLanguages().then(langIds => new CSpellClient(module, langIds));
    }
}
exports.CSpellClient = CSpellClient;
//# sourceMappingURL=cSpellClient.js.map