"use strict";
var editProcessor_1 = require('./editProcessor');
// emmet
var utils = require('emmet/lib/utils/common');
var tabStops = require('emmet/lib/assets/tabStops');
var parser = require('emmet/lib/parser/abbreviation');
/**
 * After user hit tab key and currently open file is typescript try to transform term into html like syntax.
 * In case of err or any other reason insert a tab in usual manner.
 */
var EmmetActions = (function () {
    function EmmetActions(textEditor) {
        this.textEditor = textEditor;
        this.lang = 'typescript';
        this.editProcessor = new editProcessor_1.EditProcessor(this.textEditor);
    }
    /**
     * Try to change abbreviation to html like syntax inside Angular's 2 typecript file.
     * In case of failure or for other reason handle tab key stroke event as default.
     */
    EmmetActions.prototype.emmetMe = function () {
        //let editor = vscode.window.activeTextEditor;
        if (!this.textEditor) {
            return;
        }
        var lineInfo = this.editProcessor.lineInfo;
        // just add tab
        if (!lineInfo.angularInfo.abbr) {
            this.editProcessor.addTab(lineInfo);
            return;
        }
        if (this.textEditor.document.languageId === this.lang) {
            try {
                // try to get content from abbreviation
                var options = { syntax: 'html' };
                var content = parser.expand(lineInfo.angularInfo.abbr, options);
                content = this.editProcessor.sanitizeContent(content, lineInfo);
                content = tabStops.processText(content, {
                    tabstop: function (data) {
                        return data.placeholder || '';
                    }
                });
                this.editProcessor.replaceText(content, lineInfo);
            }
            catch (e) {
                this.editProcessor.addTab(lineInfo);
            }
        }
    };
    EmmetActions.prototype.dispose = function () {
    };
    return EmmetActions;
}());
exports.EmmetActions = EmmetActions;
//# sourceMappingURL=emmetActions.js.map