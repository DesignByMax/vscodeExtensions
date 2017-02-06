"use strict";
const vscode_1 = require("vscode");
const path = require("path");
const fileUrl = require("file-url");
const extension_1 = require("./extension");
class HtmlDocumentView {
    constructor(document) {
        this.registrations = [];
        this.doc = document;
        this.provider = new HtmlDocumentContentProvider(this.doc);
        this.registrations.push(vscode_1.workspace.registerTextDocumentContentProvider("html", this.provider));
        this.previewUri = this.getHTMLUri(document.uri);
        this.registerEvents();
    }
    get uri() {
        return this.previewUri;
    }
    getHTMLUri(uri) {
        return uri.with({ scheme: 'html', path: uri.path + '.rendered', query: uri.toString() });
    }
    registerEvents() {
        vscode_1.workspace.onDidSaveTextDocument(document => {
            if (this.isHTMLFile(document)) {
                const uri = this.getHTMLUri(document.uri);
                this.provider.update(uri);
            }
        });
        vscode_1.workspace.onDidChangeTextDocument(event => {
            if (this.isHTMLFile(event.document)) {
                const uri = this.getHTMLUri(event.document.uri);
                this.provider.update(uri);
            }
        });
        vscode_1.workspace.onDidChangeConfiguration(() => {
            vscode_1.workspace.textDocuments.forEach(document => {
                if (document.uri.scheme === 'html') {
                    // update all generated md documents
                    this.provider.update(document.uri);
                }
            });
        });
        this.registrations.push(vscode_1.workspace.onDidChangeTextDocument((e) => {
            if (!this.visible) {
                return;
            }
            if (e.document === this.doc) {
                this.provider.update(this.previewUri);
            }
        }));
    }
    get visible() {
        for (let i in vscode_1.window.visibleTextEditors) {
            if (vscode_1.window.visibleTextEditors[i].document.uri === this.previewUri) {
                return true;
            }
        }
        return false;
    }
    execute(column) {
        vscode_1.commands.executeCommand("vscode.previewHtml", this.previewUri, column, `Preview '${path.basename(this.uri.fsPath)}'`).then((success) => {
        }, (reason) => {
            console.warn(reason);
            vscode_1.window.showErrorMessage(reason);
        });
    }
    dispose() {
        for (let i in this.registrations) {
            this.registrations[i].dispose();
        }
    }
    isHTMLFile(document) {
        return document.languageId === 'html'
            && document.uri.scheme !== 'html'; // prevent processing of own documents
    }
}
exports.HtmlDocumentView = HtmlDocumentView;
class HtmlDocumentContentProvider {
    constructor(document) {
        this._onDidChange = new vscode_1.EventEmitter();
        this.doc = document;
    }
    provideTextDocumentContent(uri) {
        return this.createHtmlSnippet();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    createHtmlSnippet() {
        if (this.doc.languageId !== "html" && this.doc.languageId !== "jade") {
            return this.errorSnippet("Active editor doesn't show a HTML or Jade document - no properties to preview.");
        }
        return this.preview();
    }
    errorSnippet(error) {
        return `
                <body>
                    ${error}
                </body>`;
    }
    createLocalSource(file, type) {
        let source_path = fileUrl(path.join(__dirname, "..", "..", "static", file));
        switch (type) {
            case extension_1.SourceType.SCRIPT:
                return `<script src="${source_path}"></script>`;
            case extension_1.SourceType.STYLE:
                return `<link href="${source_path}" rel="stylesheet" />`;
        }
    }
    fixLinks() {
        return this.doc.getText().replace(new RegExp("((?:src|href)=[\'\"])((?!http|\\/).*?)([\'\"])", "gmi"), (subString, p1, p2, p3) => {
            return [
                p1,
                fileUrl(path.join(path.dirname(this.doc.fileName), p2)),
                p3
            ].join("");
        });
    }
    preview() {
        return this.createLocalSource("header_fix.css", extension_1.SourceType.STYLE) +
            this.fixLinks();
    }
}
//# sourceMappingURL=document.js.map