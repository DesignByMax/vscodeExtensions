"use strict";
const vscode_1 = require('vscode');
class RestClientSettings {
    constructor() {
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
        });
        this.initializeSettings();
    }
    initializeSettings() {
        var restClientSettings = vscode_1.workspace.getConfiguration("rest-client");
        this.followRedirect = restClientSettings.get("followredirect", true);
        this.defaultUserAgent = restClientSettings.get("defaultuseragent", "vscode-restclient");
        this.showResponseInDifferentTab = restClientSettings.get("showResponseInDifferentTab", false);
        this.rememberCookiesForSubsequentRequests = restClientSettings.get("rememberCookiesForSubsequentRequests", true);
        this.timeoutInMilliseconds = restClientSettings.get("timeoutinmilliseconds", 0);
        if (this.timeoutInMilliseconds < 0) {
            this.timeoutInMilliseconds = 0;
        }
        this.excludeHostsForProxy = restClientSettings.get("excludeHostsForProxy", []);
        this.fontSize = restClientSettings.get("fontSize", null);
        this.fontFamily = restClientSettings.get("fontFamily", null);
        this.fontWeight = restClientSettings.get("fontWeight", null);
        this.environmentVariables = restClientSettings.get("environmentVariables", new Map());
        let httpSettings = vscode_1.workspace.getConfiguration('http');
        this.proxy = httpSettings.get('proxy', undefined);
        this.proxyStrictSSL = httpSettings.get('proxyStrictSSL', false);
        this.enableTelemetry = httpSettings.get('enableTelemetry', true);
    }
}
exports.RestClientSettings = RestClientSettings;
//# sourceMappingURL=configurationSettings.js.map