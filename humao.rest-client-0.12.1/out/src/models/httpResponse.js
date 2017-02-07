"use strict";
class HttpResponse {
    constructor(statusCode, statusMessage, httpVersion, headers, body, elapsedMillionSeconds, requestUrl, bodySizeInBytes) {
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.httpVersion = httpVersion;
        this.headers = headers;
        this.body = body;
        this.elapsedMillionSeconds = elapsedMillionSeconds;
        this.requestUrl = requestUrl;
        this.bodySizeInBytes = bodySizeInBytes;
    }
    getResponseHeaderValue(name) {
        if (this.headers) {
            for (var header in this.headers) {
                if (header.toLowerCase() === name.toLowerCase()) {
                    return this.headers[header];
                }
            }
        }
        return null;
    }
}
exports.HttpResponse = HttpResponse;
//# sourceMappingURL=httpResponse.js.map