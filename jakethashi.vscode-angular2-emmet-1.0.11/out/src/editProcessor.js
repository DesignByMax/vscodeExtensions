"use strict";
var vscode = require('vscode');
/**
 * Describe which direction toward the biggining or end document should we search.
 * used to show editors side by side.
 */
var Directions;
(function (Directions) {
    Directions[Directions["top"] = 0] = "top";
    Directions[Directions["bottom"] = 1] = "bottom";
})(Directions || (Directions = {}));
/**
 * Helper utility to analyzing current document in order to mimic tab feature or insert Emmet's result
 * inside template value.
 */
var EditProcessor = (function () {
    function EditProcessor(_editor) {
        this._editor = _editor;
        /**
         * Get line information for Emmet transformation.
         */
        this._cachedLines = [];
    }
    Object.defineProperty(EditProcessor.prototype, "lineInfo", {
        /**
         * Get information of current line. In case line is already known, return cached value.
         */
        get: function () {
            if (!this._lineInfo) {
                this._lineInfo = this.getContentInfo();
            }
            return this._lineInfo;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get information for current line
     */
    EditProcessor.prototype.getContentInfo = function () {
        var angularInfo = this.getAngularInfo();
        if (!angularInfo.insideComponentDecorator) {
            return {
                selection: this._editor.selection,
                angularInfo: angularInfo
            };
        }
        return {
            selection: this._editor.selection,
            abbrStartAt: this._editor.selection.start.character - angularInfo.abbr.length,
            angularInfo: angularInfo
        };
    };
    /**
     * Alter emmet's generated content into approprite form, considers editor tabs options, which suits to current document.
     *
     * @param content Result from emmet transformation.
     * @param lineInfo Information about line.
     * @return An formated text ready to paste into document.
     */
    EditProcessor.prototype.sanitizeContent = function (content, lineInfo) {
        // remove all lines in case we are not inside template literal
        if (!lineInfo.angularInfo.isTemplateLiteral) {
            return content.replace(/[\n|\t]/g, '');
        }
        var tabSize = Number(this._editor.options.tabSize);
        var tabCount = (this.lineInfo.abbrStartAt / tabSize);
        var tabs = this.createSpaces((tabSize * tabCount) - tabSize);
        var result = content.replace(/\n/g, '\n' + tabs);
        // remove tabs in case editor use spaces for indentation
        if (this._editor.options.insertSpaces) {
            var tab = this.createSpaces();
            while (~result.indexOf('\t')) {
                result = result.replace(/\t/, tab);
            }
        }
        return result;
    };
    /**
     * Remove unwanted characters from abbreviation
     *
     * @param abbreviation Syntax to be transformed to html like syntax.
     * @return Representation of html syntax
     */
    EditProcessor.prototype.sanitizeAbbreviation = function (abbr, angularInfo) {
        abbr = abbr.trim();
        abbr = abbr.replace(/template/, '');
        abbr = abbr.replace(/\s*:\s*[`|'|"]*/, '');
        abbr = abbr.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        abbr = abbr.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var terms = abbr.split('>');
        if (terms.length > 1) {
            // combine all terms which doesnt' contain allowed character
            abbr = terms
                .filter(function (item) { return item.trim().match(/^[a-zA-Z]+[\W^]*[\w]?$/); })
                .join('>');
        }
        return abbr;
    };
    /**
     * Find coordinates of one to n texts.
     *
     * @param search An array of items to be found, first match wins.
     * @param direction Determines which direction should we find.
     * @return Location inside document currently found item.
     */
    EditProcessor.prototype.findLine = function (search, direction, line, offsetChar) {
        //search = typeof search === 'string' ? [search] : search;        
        var top = direction === Directions.top;
        line = line || this._editor.selection.start.line;
        var _loop_1 = function(i) {
            var currentLine = this_1._cachedLines[i];
            if (!currentLine) {
                this_1._cachedLines[i] = currentLine = this_1._editor.document.lineAt(i).text;
            }
            if (offsetChar && i === line) {
                currentLine = currentLine.substring(offsetChar);
            }
            var foundItem;
            search.forEach(function (token) {
                var currentPosition = currentLine.indexOf(token);
                if (~currentPosition) {
                    foundItem = {
                        line: i,
                        position: currentPosition,
                        matcher: token,
                        content: currentLine
                    };
                    return;
                }
            });
            if (foundItem) {
                return { value: foundItem };
            }
        };
        var this_1 = this;
        for (var i = line; top ? i >= 0 : i < this._editor.document.lineCount; top ? i-- : i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object") return state_1.value;
        }
        return null;
    };
    /**
     * Find abbreviation together with matadata in order to determine whther an abbreviation
     * is surrounded with component decorator and is wrapped by any kind of quotes.
     *
     * @return metadata related to Angular of analyzing an abbreviation.
     */
    EditProcessor.prototype.getAngularInfo = function () {
        var isMultiline = this._editor.selection.end.line - this._editor.selection.start.line > 1;
        if (!isMultiline) {
            // TODO: !!!
            // consider component decorator as a json object and transform key value pairs into
            // valid form in order to analyze it more precisely.
            var dEnd = void 0, sTemplate = void 0;
            // 1. find position of component decorator            
            var dStart = this.findLine(['@Component'], Directions.top);
            // 2. find template
            if (dStart) {
                sTemplate = this.findLine(['template'], Directions.bottom, dStart.line);
            }
            // 3. get template type, just for now support only template literal
            var tStart;
            if (sTemplate) {
                tStart = this.findLine(['`'], Directions.bottom, sTemplate.line);
            }
            if (dStart && tStart) {
                dEnd = this.findLine(['`'], Directions.bottom, tStart.line, tStart.content.length + 1);
                // we are inside component decorator
                var cursorLine = this._editor.selection.start.line;
                if (dStart && dEnd && dStart.line < cursorLine &&
                    dEnd.line >= cursorLine &&
                    // cursor position has after template atribute
                    // TODO: check if cursor is after templates quote
                    sTemplate && sTemplate.line <= cursorLine) {
                    // find enclosing quote for template statement
                    var tEnd = this.findLine(['\'', '"', '`'], Directions.bottom);
                    var line = this._editor.document.lineAt(cursorLine);
                    var abbrCandidate = this._editor.document.getText(new vscode.Range(new vscode.Position(cursorLine, 0), this._editor.selection.end));
                    // compare wheter an extra characters are after cursor
                    if (line.text.trim() === abbrCandidate.trim()) {
                        // TODO: extend contition from template to very first quote
                        var isTemplateLiteral = sTemplate.content.indexOf('`') >= 0;
                        // replace everithing which is not part of abbreviation
                        abbrCandidate = this.sanitizeAbbreviation(abbrCandidate, null);
                        return {
                            insideComponentDecorator: true,
                            isTemplateLiteral: isTemplateLiteral,
                            abbr: abbrCandidate
                        };
                    }
                }
            }
        }
        return {
            insideComponentDecorator: false,
            abbr: null
        };
    };
    /**
     * Creates string of spaces or tabs according editor options.
     *
     * @param append Add extra spaces or tabs.
     * @return String of spaces or tabs.
     */
    EditProcessor.prototype.createSpaces = function (append) {
        append = append || 0;
        var spaces = [];
        if (!this._editor.options.insertSpaces && append === 0) {
            return '\t';
        }
        for (var i = 0; i < Number(this._editor.options.tabSize) + append; i++, spaces.push(this._editor.options.insertSpaces ? ' ' : '\t'))
            ;
        return spaces.join('');
    };
    /**
     * Add tab to current position of cursor or shift selected block.
     *
     * @param li Information about line.
     */
    EditProcessor.prototype.addTab = function (li) {
        var tabs = this.createSpaces();
        this._editor.edit(function (editBuilder) {
            if (li.selection.end.line - li.selection.start.line >= 1) {
                for (var i = li.selection.start.line; i <= li.selection.end.line; i++) {
                    editBuilder.insert(new vscode.Position(i, 0), tabs);
                }
            }
            else {
                editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character), tabs);
            }
        });
    };
    /**
     * Replace abbreviation with generated result of emmet library.
     *
     * @param content Html like content to replace abbreviation.
     * @param li Information how to replace abbreviation.
     *
     * TODO
     * it would be nice to place the content as snippet.
     */
    EditProcessor.prototype.replaceText = function (content, li) {
        this._editor.edit(function (editBuilder) {
            editBuilder.delete(new vscode.Range(new vscode.Position(li.selection.start.line, li.selection.start.character - li.angularInfo.abbr.length), new vscode.Position(li.selection.start.line, li.selection.start.character)));
            editBuilder.insert(new vscode.Position(li.selection.start.line, li.selection.start.character - li.angularInfo.abbr.length), content);
        });
    };
    /**
     * Insert centent iside given poisition.
     *
     * @param content to be inserted into position.
     * @param position line and character representing position inside an document.
     */
    EditProcessor.prototype.setText = function (content, position) {
        this._editor.edit(function (editBuilder) {
            editBuilder.insert(position, content);
        });
    };
    /**
     * Get text determined by selection.
     *
     * @param selection Range of selected area.
     * @return Selected text.
     */
    EditProcessor.prototype.getText = function (selection) {
        var response = '';
        for (var i = selection.start.line; i <= selection.end.line; i++) {
            var currentLine = this._editor.document.lineAt(i).text;
            // remove unwanted characters from begining of selection
            if (i === selection.start.line) {
                currentLine = currentLine.substring(selection.start.character);
            }
            // remove unwanted characters from end of selection
            if (i === selection.end.line) {
                currentLine = currentLine.substring(0, selection.end.character);
            }
            response += currentLine;
        }
        return response;
    };
    EditProcessor.prototype.dispose = function () {
        this._cachedLines = null;
        delete this._cachedLines;
    };
    return EditProcessor;
}());
exports.EditProcessor = EditProcessor;
//# sourceMappingURL=editProcessor.js.map