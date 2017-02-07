"use strict";
class HttpElement {
    constructor(name, type, prefix = null, description = null) {
        this.name = name;
        this.type = type;
        this.prefix = prefix;
        this.description = description;
    }
}
exports.HttpElement = HttpElement;
(function (ElementType) {
    ElementType[ElementType["Method"] = 0] = "Method";
    ElementType[ElementType["URL"] = 1] = "URL";
    ElementType[ElementType["Header"] = 2] = "Header";
    ElementType[ElementType["MIME"] = 3] = "MIME";
    ElementType[ElementType["GlobalVariable"] = 4] = "GlobalVariable";
    ElementType[ElementType["CustomVariable"] = 5] = "CustomVariable";
})(exports.ElementType || (exports.ElementType = {}));
var ElementType = exports.ElementType;
//# sourceMappingURL=httpElement.js.map