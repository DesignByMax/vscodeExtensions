"use strict";
const vscode_1 = require('vscode');
const baseTextDocumentContentProvider_1 = require('./baseTextDocumentContentProvider');
const mimeUtility_1 = require('../mimeUtility');
const Constants = require('../constants');
const path = require('path');
const hljs = require('highlight.js');
const codeHighlightLinenums = require('code-highlight-linenums');
var pd = require('pretty-data').pd;
class HttpResponseTextDocumentContentProvider extends baseTextDocumentContentProvider_1.BaseTextDocumentContentProvider {
    constructor(response, settings) {
        super();
        this.response = response;
        this.settings = settings;
    }
    provideTextDocumentContent(uri) {
        if (this.response) {
            let innerHtml;
            let width = 2;
            let contentType = this.response.getResponseHeaderValue("content-type");
            if (contentType) {
                contentType = contentType.trim();
            }
            if (contentType && mimeUtility_1.MimeUtility.isBrowserSupportedImageFormat(contentType)) {
                innerHtml = `<img src="${this.response.requestUrl}">`;
            }
            else {
                let code = `HTTP/${this.response.httpVersion} ${this.response.statusCode} ${this.response.statusMessage}
${HttpResponseTextDocumentContentProvider.formatHeaders(this.response.headers)}
${HttpResponseTextDocumentContentProvider.formatBody(this.response.body, this.response.getResponseHeaderValue("content-type"))}`;
                width = (code.split(/\r\n|\r|\n/).length + 1).toString().length;
                innerHtml = `<pre><code class="http">${codeHighlightLinenums(code, { hljs: hljs, lang: 'http', start: 1 })}</code></pre>`;
            }
            return `
            <head>
                <link rel="stylesheet" href="${HttpResponseTextDocumentContentProvider.cssFilePath}">
                ${this.getSettingsOverrideStyles(width)}
            </head>
            <body>
                <div>
                    ${innerHtml}
                    <a id="scroll-to-top" role="button" aria-label="scroll to top" onclick="scroll(0,0)"><span class="icon"></span></a>
                </div>
            </body>`;
        }
    }
    getSettingsOverrideStyles(width) {
        return [
            '<style>',
            'code {',
            this.settings.fontFamily ? `font-family: ${this.settings.fontFamily};` : '',
            this.settings.fontSize ? `font-size: ${this.settings.fontSize}px;` : '',
            this.settings.fontWeight ? `font-weight: ${this.settings.fontWeight};` : '',
            '}',
            'code .line {',
            `padding-left: calc(${width}ch + 18px );`,
            '}',
            'code .line:before {',
            `width: ${width}ch;`,
            `margin-left: calc(-${width}ch + -27px );`,
            '}',
            '</style>'].join('\n');
    }
    static formatHeaders(headers) {
        let headerString = '';
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                let value = headers[header];
                if (typeof headers[header] !== 'string') {
                    value = headers[header];
                }
                headerString += `${header}: ${value}\n`;
            }
        }
        return headerString;
    }
    static formatBody(body, contentType) {
        if (contentType) {
            let type = mimeUtility_1.MimeUtility.parse(contentType).type;
            if (type === 'application/json') {
                if (HttpResponseTextDocumentContentProvider.isJsonString(body)) {
                    body = JSON.stringify(JSON.parse(body), null, 2);
                }
                else {
                    vscode_1.window.showWarningMessage('The content type of response is application/json, while response body is not a valid json string');
                }
            }
            else if (type === 'application/xml' || type === 'text/xml') {
                body = pd.xml(body);
            }
            else if (type === 'text/css') {
                body = pd.css(body);
            }
        }
        return body;
    }
    static isJsonString(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
HttpResponseTextDocumentContentProvider.cssFilePath = path.join(vscode_1.extensions.getExtension(Constants.ExtensionId).extensionPath, Constants.CSSFolderName, Constants.CSSFileName);
exports.HttpResponseTextDocumentContentProvider = HttpResponseTextDocumentContentProvider;
//# sourceMappingURL=httpResponseTextDocumentContentProvider.js.map