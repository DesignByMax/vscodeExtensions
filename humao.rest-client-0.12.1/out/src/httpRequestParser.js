"use strict";
const httpRequest_1 = require('./models/httpRequest');
const requestParserUtil_1 = require('./requestParserUtil');
const httpClient_1 = require('./httpClient');
const os_1 = require('os');
const fs = require('fs');
const path = require('path');
class HttpRequestParser {
    parseHttpRequest(requestRawText, requestAbsoluteFilePath) {
        // parse follows http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
        // split the request raw text into lines
        let lines = requestRawText.split(os_1.EOL);
        // skip leading empty lines
        lines = HttpRequestParser.skipWhile(lines, value => value.trim() === '');
        if (lines.length === 0) {
            return null;
        }
        // parse request line
        let requestLine = HttpRequestParser.parseRequestLine(lines[0]);
        // get headers range
        let headers;
        let body;
        let bodyLineCount = 0;
        let headerStartLine = HttpRequestParser.firstIndexOf(lines, value => value.trim() !== '', 1);
        if (headerStartLine !== -1) {
            if (headerStartLine === 1) {
                // parse request headers
                let firstEmptyLine = HttpRequestParser.firstIndexOf(lines, value => value.trim() === '', headerStartLine);
                let headerEndLine = firstEmptyLine === -1 ? lines.length : firstEmptyLine;
                let headerLines = lines.slice(headerStartLine, headerEndLine);
                let index = 0;
                let queryString = '';
                for (; index < headerLines.length;) {
                    let headerLine = (headerLines[index]).trim();
                    if (headerLine[0] in { '?': '', '&': '' } && headerLine.split('=').length === 2) {
                        queryString += headerLine;
                        index++;
                        continue;
                    }
                    break;
                }
                if (queryString !== '') {
                    requestLine.url += queryString;
                }
                headers = requestParserUtil_1.RequestParserUtil.parseRequestHeaders(headerLines.slice(index));
                // get body range
                let bodyStartLine = HttpRequestParser.firstIndexOf(lines, value => value.trim() !== '', headerEndLine);
                if (bodyStartLine !== -1) {
                    firstEmptyLine = HttpRequestParser.firstIndexOf(lines, value => value.trim() === '', bodyStartLine);
                    let bodyEndLine = firstEmptyLine === -1 ? lines.length : firstEmptyLine;
                    bodyLineCount = bodyEndLine - bodyStartLine;
                    body = lines.slice(bodyStartLine, bodyEndLine).join(os_1.EOL);
                }
            }
            else {
                // parse body, since no headers provided
                let firstEmptyLine = HttpRequestParser.firstIndexOf(lines, value => value.trim() === '', headerStartLine);
                let bodyEndLine = firstEmptyLine === -1 ? lines.length : firstEmptyLine;
                bodyLineCount = bodyEndLine - headerStartLine;
                body = lines.slice(headerStartLine, bodyEndLine).join(os_1.EOL);
            }
        }
        // if Host header provided and url is relative path, change to absolute url
        if (httpClient_1.HttpClient.getHeaderValue(headers, 'Host') && requestLine.url[0] === '/') {
            requestLine.url = `http://${httpClient_1.HttpClient.getHeaderValue(headers, 'Host')}${requestLine.url}`;
        }
        // parse body
        if (bodyLineCount === 1 && HttpRequestParser.uploadFromFileSyntax.test(body)) {
            let groups = HttpRequestParser.uploadFromFileSyntax.exec(body);
            if (groups !== null && groups.length === 2) {
                let fileUploadPath = groups[1];
                if (!path.isAbsolute(fileUploadPath) && requestAbsoluteFilePath) {
                    // get path relative to this http file
                    fileUploadPath = path.join(path.dirname(requestAbsoluteFilePath), fileUploadPath);
                }
                if (fs.existsSync(fileUploadPath)) {
                    body = fs.readFileSync(fileUploadPath).toString();
                }
            }
        }
        return new httpRequest_1.HttpRequest(requestLine.method, requestLine.url, headers, body);
    }
    static parseRequestLine(line) {
        // Request-Line = Method SP Request-URI SP HTTP-Version CRLF
        let words = line.split(' ').filter(Boolean);
        let method;
        let url;
        if (words.length === 1) {
            // Only provides request url
            method = HttpRequestParser.defaultMethod;
            url = words[0];
        }
        else {
            // Provides both request method and url
            method = words.shift();
            if (words[words.length - 1].match(/HTTP\/.*/gi)) {
                words.pop();
            }
            url = words.join(' ');
        }
        return {
            method: method,
            url: url
        };
    }
    static skipWhile(items, callbackfn) {
        for (var index = 0; index < items.length; index++) {
            if (!callbackfn(items[index], index, items)) {
                break;
            }
        }
        return items.slice(index);
    }
    ;
    static firstIndexOf(items, callbackfn, start) {
        if (!start) {
            start = 0;
        }
        let index = start;
        for (; index < items.length; index++) {
            if (callbackfn(items[index], index, items)) {
                break;
            }
        }
        return index >= items.length ? -1 : index;
    }
}
HttpRequestParser.defaultMethod = 'GET';
HttpRequestParser.uploadFromFileSyntax = new RegExp('^\<[ \t]+([^ \t]*)[ \t]*$');
exports.HttpRequestParser = HttpRequestParser;
//# sourceMappingURL=httpRequestParser.js.map