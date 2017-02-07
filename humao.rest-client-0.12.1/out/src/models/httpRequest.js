"use strict";
class HttpRequest {
    constructor(method, url, headers, body) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
}
exports.HttpRequest = HttpRequest;
class SerializedHttpRequest extends HttpRequest {
}
exports.SerializedHttpRequest = SerializedHttpRequest;
//# sourceMappingURL=httpRequest.js.map