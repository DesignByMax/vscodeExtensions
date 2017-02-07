"use strict";
const httpRequest_1 = require('./models/httpRequest');
const requestParserUtil_1 = require('./requestParserUtil');
var yargs = require('yargs');
class CurlRequestParser {
    parseHttpRequest(requestRawText, requestAbsoluteFilePath) {
        let yargObject = yargs(CurlRequestParser.mergeIntoSingleLine(requestRawText.trim()));
        let parsedArguments = yargObject.argv;
        // parse url
        let url = parsedArguments._[1];
        if (!url) {
            url = parsedArguments.L || parsedArguments.location || parsedArguments.compressed;
        }
        // parse header
        let headers = {};
        if (parsedArguments.H) {
            if (!Array.isArray(parsedArguments.H)) {
                parsedArguments.H = [parsedArguments.H];
            }
            headers = requestParserUtil_1.RequestParserUtil.parseRequestHeaders(parsedArguments.H);
        }
        let user = parsedArguments.u || parsedArguments.user;
        if (user) {
            headers['Authorization'] = `Basic ${new Buffer(user).toString('base64')}`;
        }
        // parse body
        let body = parsedArguments.d || parsedArguments.data || parsedArguments['data-binary'];
        // parse method
        let method = (parsedArguments.X || parsedArguments.request);
        if (!method) {
            method = body ? "POST" : "GET";
        }
        return new httpRequest_1.HttpRequest(method, url, headers, body);
    }
    static mergeIntoSingleLine(text) {
        return text.replace(/\\\r|\\\n/g, '');
    }
}
exports.CurlRequestParser = CurlRequestParser;
//# sourceMappingURL=curlRequestParser.js.map