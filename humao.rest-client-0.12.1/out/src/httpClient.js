"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const httpResponse_1 = require('./models/httpResponse');
const persistUtility_1 = require('./persistUtility');
const mimeUtility_1 = require('./mimeUtility');
const url = require('url');
var encodeUrl = require('encodeurl');
var request = require('request');
var cookieStore = require('tough-cookie-file-store');
var iconv = require('iconv-lite');
class HttpClient {
    constructor(settings) {
        this._settings = settings;
        persistUtility_1.PersistUtility.createFileIfNotExists(persistUtility_1.PersistUtility.cookieFilePath);
    }
    send(httpRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                url: encodeUrl(httpRequest.url),
                headers: httpRequest.headers,
                method: httpRequest.method,
                body: httpRequest.body,
                encoding: null,
                time: true,
                timeout: this._settings.timeoutInMilliseconds,
                gzip: true,
                followRedirect: this._settings.followRedirect,
                jar: this._settings.rememberCookiesForSubsequentRequests ? request.jar(new cookieStore(persistUtility_1.PersistUtility.cookieFilePath)) : false
            };
            // set proxy
            options.proxy = HttpClient.ignoreProxy(httpRequest.url, this._settings.excludeHostsForProxy) ? null : this._settings.proxy;
            options.strictSSL = options.proxy && options.proxy.length > 0 ? this._settings.proxyStrictSSL : false;
            if (!options.headers) {
                options.headers = httpRequest.headers = {};
            }
            // add default user agent if not specified
            if (!HttpClient.getHeaderValue(options.headers, 'User-Agent')) {
                options.headers['User-Agent'] = this._settings.defaultUserAgent;
            }
            let size = 0;
            return new Promise((resolve, reject) => {
                request(options, function (error, response, body) {
                    if (error) {
                        if (error.message) {
                            if (error.message.startsWith("Header name must be a valid HTTP Token")) {
                                error.message = "Header must be in 'header name: header value' format, "
                                    + "please also make sure there is a blank line between headers and body";
                            }
                        }
                        reject(error);
                        return;
                    }
                    let contentType = HttpClient.getHeaderValue(response.headers, 'Content-Type');
                    let encoding;
                    if (contentType) {
                        encoding = mimeUtility_1.MimeUtility.parse(contentType).charset;
                    }
                    if (!encoding) {
                        encoding = "utf8";
                    }
                    let buffer = new Buffer(body);
                    try {
                        body = iconv.decode(buffer, encoding);
                    }
                    catch (e) {
                        if (encoding !== 'utf8') {
                            body = iconv.decode(buffer, 'utf8');
                        }
                    }
                    // adjust response header case, due to the response headers in request package is in lowercase
                    var headersDic = HttpClient.getResponseRawHeaderNames(response.rawHeaders);
                    let adjustedResponseHeaders = {};
                    for (var header in response.headers) {
                        let adjustedHeaderName = header;
                        if (headersDic[header]) {
                            adjustedHeaderName = headersDic[header];
                            adjustedResponseHeaders[headersDic[header]] = response.headers[header];
                        }
                        adjustedResponseHeaders[adjustedHeaderName] = response.headers[header];
                    }
                    resolve(new httpResponse_1.HttpResponse(response.statusCode, response.statusMessage, response.httpVersion, adjustedResponseHeaders, body, response.elapsedTime, httpRequest.url, size));
                })
                    .on('data', function (data) {
                    size += data.length;
                });
            });
        });
    }
    static getHeaderValue(headers, headerName) {
        if (headers) {
            for (var key in headers) {
                if (key.toLowerCase() === headerName.toLowerCase()) {
                    return headers[key];
                }
            }
        }
        return null;
    }
    static getResponseRawHeaderNames(rawHeaders) {
        let result = {};
        rawHeaders.forEach(header => {
            result[header.toLowerCase()] = header;
        });
        return result;
    }
    static ignoreProxy(requestUrl, excludeHostsForProxy) {
        if (!excludeHostsForProxy || excludeHostsForProxy.length === 0) {
            return false;
        }
        let resolvedUrl = url.parse(requestUrl);
        let hostName = resolvedUrl.hostname.toLowerCase();
        let port = resolvedUrl.port;
        let excludeHostsProxyList = Array.from(new Set(excludeHostsForProxy.map(eh => eh.toLowerCase())));
        for (var index = 0; index < excludeHostsProxyList.length; index++) {
            var eh = excludeHostsProxyList[index];
            let urlParts = eh.split(":");
            if (!port) {
                // if no port specified in request url, host name must exactly match
                if (urlParts.length === 1 && urlParts[0] === hostName) {
                    return true;
                }
                ;
            }
            else {
                // if port specified, match host without port or hostname:port exactly match
                if (urlParts.length === 1 && urlParts[0] === hostName) {
                    return true;
                }
                else if (urlParts.length === 2 && urlParts[0] === hostName && urlParts[1] === port) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpClient.js.map