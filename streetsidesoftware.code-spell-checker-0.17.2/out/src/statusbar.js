"use strict";
const path = require("path");
const vscode_1 = require("vscode");
const vscode = require("vscode");
const cSpellInfo = require("./cSpellInfo");
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
        client.isSpellCheckEnabled(e.document)
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
                    sbCheck.command = cSpellInfo.commandDisplayCSpellInfo;
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
exports.initStatusBar = initStatusBar;
//# sourceMappingURL=statusbar.js.map