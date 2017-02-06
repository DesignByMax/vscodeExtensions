"use strict";
const path = require("path");
const CSpellSettings = require("./CSpellSettings");
const Rx = require("rx");
const R = require("ramda");
const vscode_1 = require("vscode");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
// const extensionId = 'streetsidesoftware.code-spell-checker'
const baseConfigName = CSpellSettings.defaultFileName;
const configFileGlob = `**/${baseConfigName}`;
const findConfig = `.vscode/${baseConfigName}`;
function getDefaultWorkspaceConfigLocation() {
    const { rootPath } = vscode_1.workspace;
    return rootPath
        ? path.join(rootPath, '.vscode', baseConfigName)
        : undefined;
}
function getSettings() {
    return Rx.Observable.fromPromise(vscode_1.workspace.findFiles(findConfig, '{**/node_modules,**/.git}'))
        .flatMap(matches => {
        if (!matches || !matches.length) {
            const settings = CSpellSettings.getDefaultSettings();
            return Rx.Observable.just(getDefaultWorkspaceConfigLocation())
                .map(path => ({ path, settings }));
        }
        else {
            const path = matches[0].fsPath;
            return Rx.Observable.fromPromise(CSpellSettings.readSettings(path))
                .map(settings => ({ path, settings }));
        }
    });
}
function applyTextEdits(uri, documentVersion, edits) {
    const textEditor = vscode_1.window.activeTextEditor;
    if (textEditor && textEditor.document.uri.toString() === uri) {
        if (textEditor.document.version !== documentVersion) {
            vscode_1.window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
        }
        textEditor.edit(mutator => {
            for (const edit of edits) {
                mutator.replace(vscode_languageclient_1.Protocol2Code.asRange(edit.range), edit.newText);
            }
        }).then((success) => {
            if (!success) {
                vscode_1.window.showErrorMessage('Failed to apply spelling changes to the document.');
            }
        });
    }
}
function addWordToWorkspaceDictionary(word) {
    getSettings().subscribe(settingsInfo => {
        const { path, settings } = settingsInfo;
        if (path === undefined) {
            // The path is undefined if the workspace consists of a single file.  In that case, we need to add the word
            // to the global userWords.
            addWordToUserDictionary(word);
        }
        else {
            settings.words.push(word);
            settings.words = R.uniq(settings.words);
            CSpellSettings.updateSettings(path, settings);
        }
    });
}
function addWordToUserDictionary(word) {
    const config = vscode_1.workspace.getConfiguration();
    const userWords = config.get('cSpell.userWords');
    userWords.push(word);
    config.update('cSpell.userWords', R.uniq(userWords), true);
}
function userCommandAddWordToDictionary(prompt, fnAddWord) {
    return function () {
        const { activeTextEditor = {} } = vscode_1.window;
        const { selection, document } = activeTextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : '';
        vscode_1.window.showInputBox({ prompt, value }).then(word => {
            if (word) {
                fnAddWord(word);
            }
        });
    };
}
function setEnableSpellChecking(enabled) {
    vscode_1.workspace.getConfiguration().update('cSpell.enabled', enabled);
}
function initStatusBar(context, client) {
    const sbCheck = vscode_1.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    function updateStatusBarWithSpellCheckStatus(e) {
        if (!e) {
            return;
        }
        const { uri = { fsPath: undefined }, languageId = '' } = e.document || { uri: { fsPath: undefined }, languageId: '' };
        const genOnOffIcon = (on) => on ? '$(checklist)' : '$(stop)';
        sbCheck.color = 'white';
        sbCheck.text = '$(clock)';
        sbCheck.tooltip = 'cSpell waiting...';
        sbCheck.show();
        client.sendRequest({ method: 'isSpellCheckEnabled' }, { uri: uri.toString(), languageId })
            .then((response) => {
            const { activeTextEditor } = vscode_1.window;
            if (activeTextEditor && activeTextEditor.document) {
                const { document } = activeTextEditor;
                if (document.uri === uri) {
                    const { languageEnabled = true, fileEnabled = true } = response;
                    const isChecked = languageEnabled && fileEnabled;
                    const isCheckedText = isChecked ? 'is' : 'is NOT';
                    const langReason = languageEnabled ? '' : `The "${languageId}" language is not enabled.`;
                    const fileReason = fileEnabled ? '' : `The file path is excluded in settings.`;
                    const fileName = path.basename(uri.fsPath);
                    const langText = `${genOnOffIcon(languageEnabled)} ${languageId}`;
                    const fileText = `${genOnOffIcon(fileEnabled)} ${fileName}`;
                    const reason = [`"${fileName}" ${isCheckedText} spell checked.`, langReason, fileReason].filter(a => !!a).join(' ');
                    sbCheck.text = `${langText} | ${fileText}`;
                    sbCheck.tooltip = reason;
                    sbCheck.show();
                }
            }
        });
    }
    function onDidChangeActiveTextEditor(e) {
        const settings = vscode_1.workspace.getConfiguration().get('cSpell');
        const { enabled, showStatus = true } = settings;
        if (!showStatus) {
            sbCheck.hide();
            return;
        }
        if (enabled) {
            updateStatusBarWithSpellCheckStatus(e);
        }
        else {
            sbCheck.text = '$(stop) cSpell';
            sbCheck.tooltip = 'Enable spell checking';
            sbCheck.command = 'cSpell.enableForWorkspace';
            sbCheck.show();
        }
    }
    function onDidChangeConfiguration() {
        if (vscode_1.window.activeTextEditor) {
            onDidChangeActiveTextEditor(vscode_1.window.activeTextEditor);
        }
    }
    sbCheck.text = '$(clock)';
    sbCheck.show();
    context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor), vscode_1.workspace.onDidChangeConfiguration(onDidChangeConfiguration), sbCheck);
    if (vscode_1.window.activeTextEditor) {
        onDidChangeActiveTextEditor(vscode_1.window.activeTextEditor);
    }
}
function activate(context) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    // The debug options for the server
    const debugOptions = { execArgv: ['--nolazy', '--debug=60048'] };
    // If the extension is launched in debug mode the debug server options are use
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    const configWatcher = vscode_1.workspace.createFileSystemWatcher(configFileGlob);
    const workspaceConfig = vscode_1.workspace.getConfiguration();
    const settings = workspaceConfig.get('cSpell');
    // Options to control the language client
    const clientOptions = {
        // Register the server for plain text documents
        documentSelector: settings.enabledLanguageIds,
        synchronize: {
            // Synchronize the setting section 'spellChecker' to the server
            configurationSection: ['cSpell', 'search']
        }
    };
    // Create the language client and start the client.
    const client = new vscode_languageclient_1.LanguageClient('Code Spell Checker', serverOptions, clientOptions);
    const clientDispose = client.start();
    function triggerGetSettings() {
        const cSpell = workspaceConfig.get('cSpell');
        const search = workspaceConfig.get('search');
        client.sendNotification({ method: 'applySettings' }, { settings: { cSpell, search } });
    }
    const actionAddWordToWorkspace = userCommandAddWordToDictionary('Add Word to Workspace Dictionary', addWordToWorkspaceDictionary);
    const actionAddWordToDictionary = userCommandAddWordToDictionary('Add Word to Dictionary', addWordToUserDictionary);
    initStatusBar(context, client);
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(clientDispose, vscode_1.commands.registerCommand('cSpell.editText', applyTextEdits), vscode_1.commands.registerCommand('cSpell.addWordToDictionarySilent', addWordToWorkspaceDictionary), vscode_1.commands.registerCommand('cSpell.addWordToUserDictionarySilent', addWordToUserDictionary), vscode_1.commands.registerCommand('cSpell.addWordToDictionary', actionAddWordToWorkspace), vscode_1.commands.registerCommand('cSpell.addWordToUserDictionary', actionAddWordToDictionary), vscode_1.commands.registerCommand('cSpell.enableForWorkspace', () => setEnableSpellChecking(true)), vscode_1.commands.registerCommand('cSpell.disableForWorkspace', () => setEnableSpellChecking(false)), configWatcher.onDidChange(triggerGetSettings), configWatcher.onDidCreate(triggerGetSettings), configWatcher.onDidDelete(triggerGetSettings));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map