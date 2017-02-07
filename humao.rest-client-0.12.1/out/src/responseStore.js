"use strict";
class ResponseStore {
    static add(uri, response) {
        ResponseStore.cache.set(uri, response);
        ResponseStore.lastResponseUri = uri;
    }
    static get(uri) {
        return ResponseStore.cache.get(uri);
    }
    static getLatestResponse() {
        return ResponseStore.lastResponseUri !== null
            ? ResponseStore.get(ResponseStore.lastResponseUri)
            : null;
    }
}
ResponseStore.cache = new Map();
ResponseStore.lastResponseUri = null;
exports.ResponseStore = ResponseStore;
//# sourceMappingURL=responseStore.js.map