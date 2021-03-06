"use strict";
// Exclude Expressions
exports.regExMatchUrls = /(?:https?|ftp):\/\/\S+/gi;
exports.regExHexDigits = /^x?[0-1a-f]+$/i;
exports.regExMatchCommonHexFormats = /(?:#[0-9a-f]{3,8})|(?:0x[0-9a-f]+)|(?:\\u[0-9a-f]{4})|(?:\\x\{[0-9a-f]{4}\})/gi;
exports.regExSpellingGuard = /(?:spell-?checker|cSpell)::?\s*disable\b(?:.|\s)*?(?:(?:spell-?checker|cSpell)::?\s*enable\b|$)/gi;
exports.regExPublicKey = /BEGIN\s+PUBLIC\s+KEY(?:.|\s)+?END\s+PUBLIC\s+KEY/gi;
exports.regExCert = /BEGIN\s+CERTIFICATE(?:.|\s)+?END\s+CERTIFICATE/gi;
exports.regExEscapeCharacters = /\\(?:[anrvtbf]|[xu][a-f0-9]+)/gi;
exports.regExBase64 = /(?:[a-z0-9\/+]{40,}\s*)+(?:[a-z0-9\/+]+=*)?/gi;
// Include Expressions
exports.regExPhpHereDoc = /<<<['"]?(\w+)['"]?(?:.|\s)+?^\1;/gim;
exports.regExString = /(?:(['"])(?:\\\\|(?:\\\1)|[^\1\n])+\1)|(?:([`])(?:\\\\|(?:\\\2)|[^\2])+\2)/gi;
// Note: the C Style Comments incorrectly considers '/*' and '//' inside of strings as comments.
exports.regExCStyleComments = /(?:\/\/.*$)|(?:\/\*(?:.|\s)+?\*\/)/gim;
exports.regExEmail = /<?[\w.\-+]+@\w+(\.\w+)+>?/gi;
//# sourceMappingURL=RegExpPatterns.js.map