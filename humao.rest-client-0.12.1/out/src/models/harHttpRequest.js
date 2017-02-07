"use strict";
class HARHeader {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.HARHeader = HARHeader;
class HARCookie {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.HARCookie = HARCookie;
class HARPostData {
    constructor(mimeType, text) {
        this.mimeType = mimeType;
        this.text = text;
    }
}
exports.HARPostData = HARPostData;
class HARHttpRequest {
    constructor(method, url, headers, cookies, postData) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.cookies = cookies;
        this.postData = postData;
    }
}
exports.HARHttpRequest = HARHttpRequest;
//# sourceMappingURL=harHttpRequest.js.map