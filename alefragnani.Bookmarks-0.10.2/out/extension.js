"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var fs = require('fs');
// this method is called when vs code is activated
function activate(context) {
    var NO_BOOKMARKS = -1;
    var NO_MORE_BOOKMARKS = -2;
    var JUMP_FORWARD = 1;
    var JUMP_BACKWARD = -1;
    var JUMP_DIRECTION;
    (function (JUMP_DIRECTION) {
        JUMP_DIRECTION[JUMP_DIRECTION["JUMP_FORWARD"] = 0] = "JUMP_FORWARD";
        JUMP_DIRECTION[JUMP_DIRECTION["JUMP_BACKWARD"] = 1] = "JUMP_BACKWARD";
    })(JUMP_DIRECTION || (JUMP_DIRECTION = {}));
    ;
    var bookmarks;
    var activeEditorCountLine;
    var Bookmark = (function () {
        function Bookmark(fsPath) {
            this.fsPath = fsPath;
            this.bookmarks = [];
        }
        Bookmark.prototype.nextBookmark = function (currentline, direction) {
            var _this = this;
            if (direction === void 0) { direction = JUMP_FORWARD; }
            return new Promise(function (resolve, reject) {
                if (typeof _this.bookmarks == 'undefined') {
                    reject('typeof this.bookmarks == "undefined"');
                    return;
                }
                var navigateThroughAllFiles;
                navigateThroughAllFiles = vscode.workspace.getConfiguration('bookmarks').get('navigateThroughAllFiles', false);
                if (_this.bookmarks.length == 0) {
                    if (navigateThroughAllFiles) {
                        resolve(NO_BOOKMARKS);
                        return;
                    }
                    else {
                        resolve(currentline);
                        return;
                    }
                }
                var nextBookmark;
                if (direction == JUMP_FORWARD) {
                    for (var index = 0; index < _this.bookmarks.length; index++) {
                        var element = _this.bookmarks[index];
                        if (element > currentline) {
                            nextBookmark = element;
                            break;
                        }
                    }
                    if (typeof nextBookmark == 'undefined') {
                        if (navigateThroughAllFiles) {
                            resolve(NO_MORE_BOOKMARKS);
                            return;
                        }
                        else {
                            resolve(_this.bookmarks[0]);
                            return;
                        }
                    }
                    else {
                        resolve(nextBookmark);
                        return;
                    }
                }
                else {
                    for (var index = activeBookmark.bookmarks.length; index >= 0; index--) {
                        var element = activeBookmark.bookmarks[index];
                        if (element < currentline) {
                            nextBookmark = element;
                            break;
                        }
                    }
                    if (typeof nextBookmark == 'undefined') {
                        if (navigateThroughAllFiles) {
                            resolve(NO_MORE_BOOKMARKS);
                            return;
                        }
                        else {
                            resolve(activeBookmark.bookmarks[activeBookmark.bookmarks.length - 1]);
                            return;
                        }
                    }
                    else {
                        resolve(nextBookmark);
                        return;
                    }
                }
            });
        };
        Bookmark.prototype.listBookmarks = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.bookmarks.length == 0) {
                    resolve({});
                    return;
                }
                var uriDocBookmark = vscode.Uri.file(_this.fsPath);
                vscode.workspace.openTextDocument(uriDocBookmark).then(function (doc) {
                    var items = [];
                    var invalids = [];
                    for (var index = 0; index < _this.bookmarks.length; index++) {
                        var element = _this.bookmarks[index] + 1;
                        // check for 'invalidated' bookmarks, when its outside the document length
                        if (element <= doc.lineCount) {
                            var lineText = doc.lineAt(element - 1).text;
                            var normalizedPath = doc.uri.fsPath;
                            items.push({
                                label: element.toString(),
                                description: lineText,
                                detail: normalizedPath
                            });
                        }
                        else {
                            invalids.push(element);
                        }
                    }
                    if (invalids.length > 0) {
                        var idxInvalid = void 0;
                        for (var indexI = 0; indexI < invalids.length; indexI++) {
                            idxInvalid = _this.bookmarks.indexOf(invalids[indexI] - 1);
                            _this.bookmarks.splice(idxInvalid, 1);
                        }
                    }
                    resolve(items);
                    return;
                });
            });
        };
        Bookmark.prototype.clear = function () {
            this.bookmarks.length = 0;
        };
        return Bookmark;
    }());
    var Bookmarks = (function () {
        function Bookmarks(jsonObject) {
            this.bookmarks = [];
        }
        Bookmarks.prototype.loadFrom = function (jsonObject) {
            if (jsonObject == '') {
                return;
            }
            var jsonBookmarks = jsonObject.bookmarks;
            for (var idx = 0; idx < jsonBookmarks.length; idx++) {
                var jsonBookmark = jsonBookmarks[idx];
                // each bookmark (line)
                this.add(jsonBookmark.fsPath);
                for (var index = 0; index < jsonBookmark.bookmarks.length; index++) {
                    this.bookmarks[idx].bookmarks.push(jsonBookmark.bookmarks[index]);
                }
            }
        };
        Bookmarks.normalize = function (uri) {
            // a simple workaround for what appears to be a vscode.Uri bug
            // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
            return uri.replace('///', '/');
        };
        Bookmarks.prototype.fromUri = function (uri) {
            uri = Bookmarks.normalize(uri);
            for (var index = 0; index < this.bookmarks.length; index++) {
                var element = this.bookmarks[index];
                if (element.fsPath == uri) {
                    return element;
                }
            }
        };
        Bookmarks.prototype.add = function (uri) {
            //console.log(`Adding bookmark/file: ${uri}`);
            uri = Bookmarks.normalize(uri);
            var existing = this.fromUri(uri);
            if (typeof existing == 'undefined') {
                var bookmark = new Bookmark(uri);
                this.bookmarks.push(bookmark);
            }
        };
        Bookmarks.prototype.nextDocumentWithBookmarks = function (active, direction) {
            var _this = this;
            if (direction === void 0) { direction = JUMP_FORWARD; }
            var currentBookmark = active;
            var currentBookmarkId;
            for (var index = 0; index < this.bookmarks.length; index++) {
                var element = this.bookmarks[index];
                if (element == active) {
                    currentBookmarkId = index;
                }
            }
            return new Promise(function (resolve, reject) {
                if (direction == JUMP_FORWARD) {
                    currentBookmarkId++;
                    if (currentBookmarkId == bookmarks.bookmarks.length) {
                        currentBookmarkId = 0;
                    }
                }
                else {
                    currentBookmarkId--;
                    if (currentBookmarkId == -1) {
                        currentBookmarkId = bookmarks.bookmarks.length - 1;
                    }
                }
                currentBookmark = _this.bookmarks[currentBookmarkId];
                if (currentBookmark.bookmarks.length == 0) {
                    if (currentBookmark == activeBookmark) {
                        resolve(NO_MORE_BOOKMARKS);
                        return;
                    }
                    else {
                        _this.nextDocumentWithBookmarks(currentBookmark, direction)
                            .then(function (nextDocument) {
                            resolve(nextDocument);
                            return;
                        })
                            .catch(function (error) {
                            reject(error);
                            return;
                        });
                    }
                }
                else {
                    if (fs.existsSync(currentBookmark.fsPath)) {
                        resolve(currentBookmark.fsPath);
                        return;
                    }
                    else {
                        _this.nextDocumentWithBookmarks(currentBookmark, direction)
                            .then(function (nextDocument) {
                            resolve(nextDocument);
                            return;
                        })
                            .catch(function (error) {
                            reject(error);
                            return;
                        });
                    }
                }
            });
        };
        Bookmarks.prototype.nextBookmark = function (active, currentLine) {
            var _this = this;
            var currentBookmark = active;
            var currentBookmarkId;
            for (var index = 0; index < this.bookmarks.length; index++) {
                var element = this.bookmarks[index];
                if (element == active) {
                    currentBookmarkId = index;
                }
            }
            return new Promise(function (resolve, reject) {
                currentBookmark.nextBookmark(currentLine)
                    .then(function (newLine) {
                    resolve(newLine);
                    return;
                })
                    .catch(function (error) {
                    // next document                  
                    currentBookmarkId++;
                    if (currentBookmarkId = bookmarks.bookmarks.length) {
                        currentBookmarkId = 0;
                    }
                    currentBookmark = _this.bookmarks[currentBookmarkId];
                });
            });
        };
        return Bookmarks;
    }());
    // console.log('Bookmarks is activated');
    //var bookmarks: Bookmarks;
    // load pre-saved bookmarks
    var didLoadBookmarks = loadWorkspaceState();
    // Define the Bookmark Decoration
    var pathIcon = vscode.workspace.getConfiguration('bookmarks').get('gutterIconPath', '');
    if (pathIcon != '') {
        if (!fs.existsSync(pathIcon)) {
            vscode.window.showErrorMessage('The file "' + pathIcon + '" used for "bookmarks.gutterIconPath" does not exists.');
            pathIcon = context.asAbsolutePath('images\\bookmark.png');
        }
    }
    else {
        pathIcon = context.asAbsolutePath('images\\bookmark.png');
    }
    pathIcon = pathIcon.replace(/\\/g, "/");
    //	let pathIcon = context.asAbsolutePath('images\\bookmark.png');
    var bookmarkDecorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: pathIcon,
        overviewRulerLane: vscode.OverviewRulerLane.Full,
        overviewRulerColor: 'rgba(21, 126, 251, 0.7)'
    });
    // Connect it to the Editors Events
    var activeEditor = vscode.window.activeTextEditor;
    var activeBookmark;
    if (activeEditor) {
        if (!didLoadBookmarks) {
            bookmarks.add(activeEditor.document.uri.fsPath);
        }
        activeEditorCountLine = activeEditor.document.lineCount;
        activeBookmark = bookmarks.fromUri(activeEditor.document.uri.fsPath);
        triggerUpdateDecorations();
    }
    // new docs
    vscode.workspace.onDidOpenTextDocument(function (doc) {
        activeEditorCountLine = doc.lineCount;
        bookmarks.add(doc.uri.fsPath);
    });
    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        activeEditor = editor;
        if (editor) {
            activeEditorCountLine = editor.document.lineCount;
            activeBookmark = bookmarks.fromUri(editor.document.uri.fsPath);
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (activeEditor && event.document === activeEditor.document) {
            //            triggerUpdateDecorations();
            var updatedBookmark = true;
            // call sticky function when the activeEditor is changed
            if (activeBookmark && activeBookmark.bookmarks.length > 0) {
                updatedBookmark = stickyBookmarks(event);
            }
            activeEditorCountLine = event.document.lineCount;
            updateDecorations();
            if (updatedBookmark) {
                saveWorkspaceState();
            }
        }
    }, null, context.subscriptions);
    // Timeout
    var timeout = null;
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 100);
    }
    // Evaluate (prepare the list) and DRAW
    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        if (!activeBookmark) {
            return;
        }
        if (activeBookmark.bookmarks.length == 0) {
            var books = [];
            activeEditor.setDecorations(bookmarkDecorationType, books);
            return;
        }
        var books = [];
        // Remove all bookmarks if active file is empty
        if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
            activeBookmark.bookmarks = [];
        }
        else {
            var invalids = [];
            for (var index = 0; index < activeBookmark.bookmarks.length; index++) {
                var element = activeBookmark.bookmarks[index];
                if (element <= activeEditor.document.lineCount) {
                    var decoration = new vscode.Range(element, 0, element, 0);
                    books.push(decoration);
                }
                else {
                    invalids.push(element);
                }
            }
            if (invalids.length > 0) {
                var idxInvalid = void 0;
                for (var indexI = 0; indexI < invalids.length; indexI++) {
                    idxInvalid = activeBookmark.bookmarks.indexOf(invalids[indexI]);
                    activeBookmark.bookmarks.splice(idxInvalid, 1);
                }
            }
        }
        activeEditor.setDecorations(bookmarkDecorationType, books);
    }
    vscode.commands.registerCommand('bookmarks.clear', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to clear bookmarks');
            return;
        }
        activeBookmark.clear();
        saveWorkspaceState();
        updateDecorations();
    });
    vscode.commands.registerCommand('bookmarks.clearFromAllFiles', function () {
        for (var index = 0; index < bookmarks.bookmarks.length; index++) {
            var element = bookmarks.bookmarks[index];
            element.clear();
        }
        saveWorkspaceState();
        updateDecorations();
    });
    function selectLines(editor, lines) {
        var doc = editor.document;
        editor.selections.shift();
        var sels = new Array();
        var newSe;
        lines.forEach(function (line) {
            newSe = new vscode.Selection(line, 0, line, doc.lineAt(line).text.length);
            sels.push(newSe);
        });
        editor.selections = sels;
    }
    vscode.commands.registerCommand('bookmarks.selectLines', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to clear bookmarks');
            return;
        }
        if (activeBookmark.bookmarks.length == 0) {
            vscode.window.showInformationMessage('No Bookmark found');
            return;
        }
        selectLines(vscode.window.activeTextEditor, activeBookmark.bookmarks);
    });
    function selectLineRange(editor, fromLine, fromCharacter, toLine, direction) {
        var doc = editor.document;
        editor.selections = [];
        var newSe;
        if (direction == JUMP_FORWARD) {
            newSe = new vscode.Selection(fromLine, fromCharacter, toLine, doc.lineAt(toLine).text.length);
        }
        else {
            newSe = new vscode.Selection(fromLine, fromCharacter, toLine, 0);
        }
        editor.selection = newSe;
    }
    function expandLineRange(editor, toLine, direction) {
        var doc = editor.document;
        var newSe;
        var actualSelection = editor.selection;
        // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
        if (direction == JUMP_FORWARD) {
            if (actualSelection.isEmpty || !actualSelection.isReversed) {
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
            }
            else {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, doc.lineAt(toLine).text.length);
            }
        }
        else {
            if (actualSelection.isEmpty || !actualSelection.isReversed) {
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, 0);
            }
            else {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
            }
        }
        editor.selection = newSe;
    }
    function shrinkLineRange(editor, toLine, direction) {
        var doc = editor.document;
        var newSe;
        var actualSelection = editor.selection;
        // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
        if (direction == JUMP_FORWARD) {
            newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
        }
        else {
            newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
        }
        editor.selection = newSe;
    }
    vscode.commands.registerCommand('bookmarks.expandSelectionToNext', function () { return expandSelectionToNextBookmark(JUMP_FORWARD); });
    vscode.commands.registerCommand('bookmarks.expandSelectionToPrevious', function () { return expandSelectionToNextBookmark(JUMP_BACKWARD); });
    vscode.commands.registerCommand('bookmarks.shrinkSelection', function () { return shrinkSelection(); });
    function shrinkSelection() {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to shrink bookmark selection');
            return;
        }
        if (vscode.window.activeTextEditor.selections.length > 1) {
            vscode.window.showInformationMessage('Command not supported with more than one selection');
            return;
        }
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            vscode.window.showInformationMessage('No selection found');
            return;
        }
        if (activeBookmark.bookmarks.length == 0) {
            vscode.window.showInformationMessage('No Bookmark found');
            return;
        }
        // which direction?
        var direction = vscode.window.activeTextEditor.selection.isReversed ? JUMP_FORWARD : JUMP_BACKWARD;
        var offset = direction === JUMP_BACKWARD ? 1 : 0;
        var activeSelectionStartLine = vscode.window.activeTextEditor.selection.isReversed ? vscode.window.activeTextEditor.selection.end.line : vscode.window.activeTextEditor.selection.start.line;
        var baseLine;
        if (direction === JUMP_FORWARD) {
            baseLine = vscode.window.activeTextEditor.selection.start.line;
        }
        else {
            baseLine = vscode.window.activeTextEditor.selection.end.line;
        }
        activeBookmark.nextBookmark(baseLine, direction)
            .then(function (nextLine) {
            if ((nextLine == NO_MORE_BOOKMARKS) || (nextLine == NO_BOOKMARKS)) {
                vscode.window.setStatusBarMessage('No more bookmarks', 2000);
                return;
            }
            else {
                if ((direction === JUMP_BACKWARD && nextLine < activeSelectionStartLine) ||
                    (direction === JUMP_FORWARD && nextLine > activeSelectionStartLine)) {
                    //vscode.window.showInformationMessage('No more bookmarks to shrink...');
                    vscode.window.setStatusBarMessage('No more bookmarks to shrink', 2000);
                }
                else {
                    shrinkLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString()), direction);
                }
            }
        })
            .catch(function (error) {
            console.log('activeBookmark.nextBookmark REJECT' + error);
        });
    }
    function expandSelectionToNextBookmark(direction) {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to clear bookmarks');
            return;
        }
        if (activeBookmark.bookmarks.length == 0) {
            vscode.window.showInformationMessage('No Bookmark found');
            return;
        }
        if (activeBookmark.bookmarks.length == 1) {
            vscode.window.showInformationMessage('There is only one bookmark in this file');
            return;
        }
        var baseLine;
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            baseLine = vscode.window.activeTextEditor.selection.active.line;
        }
        else {
            if (direction === JUMP_FORWARD) {
                baseLine = vscode.window.activeTextEditor.selection.end.line;
            }
            else {
                baseLine = vscode.window.activeTextEditor.selection.start.line;
            }
        }
        activeBookmark.nextBookmark(baseLine, direction)
            .then(function (nextLine) {
            if ((nextLine == NO_MORE_BOOKMARKS) || (nextLine == NO_BOOKMARKS)) {
                // vscode.window.showInformationMessage('No more bookmarks...');
                vscode.window.setStatusBarMessage('No more bookmarks', 2000);
                return;
            }
            else {
                expandLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString()), direction);
            }
        })
            .catch(function (error) {
            console.log('activeBookmark.nextBookmark REJECT' + error);
        });
    }
    ;
    // other commands
    vscode.commands.registerCommand('bookmarks.toggle', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to toggle bookmarks');
            return;
        }
        var line = vscode.window.activeTextEditor.selection.active.line;
        // fix issue emptyAtLaunch
        if (!activeBookmark) {
            bookmarks.add(vscode.window.activeTextEditor.document.uri.fsPath);
            activeBookmark = bookmarks.fromUri(vscode.window.activeTextEditor.document.uri.fsPath);
        }
        var index = activeBookmark.bookmarks.indexOf(line);
        if (index < 0) {
            activeBookmark.bookmarks.push(line);
        }
        else {
            activeBookmark.bookmarks.splice(index, 1);
        }
        // sorted
        var itemsSorted = activeBookmark.bookmarks.sort(function (n1, n2) {
            if (n1 > n2) {
                return 1;
            }
            if (n1 < n2) {
                return -1;
            }
            return 0;
        });
        saveWorkspaceState();
        updateDecorations();
    });
    vscode.commands.registerCommand('bookmarks.jumpToNext', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to jump to bookmarks');
            return;
        }
        if (!activeBookmark) {
            return;
        }
        // 
        activeBookmark.nextBookmark(vscode.window.activeTextEditor.selection.active.line)
            .then(function (nextLine) {
            if ((nextLine == NO_MORE_BOOKMARKS) || (nextLine == NO_BOOKMARKS)) {
                bookmarks.nextDocumentWithBookmarks(activeBookmark)
                    .then(function (nextDocument) {
                    if (nextDocument == NO_MORE_BOOKMARKS) {
                        return;
                    }
                    // same document?
                    var activeDocument = Bookmarks.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
                    if (nextDocument.toString() == activeDocument) {
                        revealLine(activeBookmark.bookmarks[0]);
                    }
                    else {
                        vscode.workspace.openTextDocument(nextDocument.toString()).then(function (doc) {
                            vscode.window.showTextDocument(doc).then(function (editor) {
                                revealLine(activeBookmark.bookmarks[0]);
                            });
                        });
                    }
                })
                    .catch(function (error) {
                    vscode.window.showInformationMessage('No more bookmarks...');
                });
            }
            else {
                revealLine(parseInt(nextLine.toString()));
            }
        })
            .catch(function (error) {
            console.log('activeBookmark.nextBookmark REJECT' + error);
        });
    });
    vscode.commands.registerCommand('bookmarks.jumpToPrevious', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to jump to bookmarks');
            return;
        }
        if (!activeBookmark) {
            return;
        }
        // 
        activeBookmark.nextBookmark(vscode.window.activeTextEditor.selection.active.line, JUMP_BACKWARD)
            .then(function (nextLine) {
            if ((nextLine == NO_MORE_BOOKMARKS) || (nextLine == NO_BOOKMARKS)) {
                bookmarks.nextDocumentWithBookmarks(activeBookmark, JUMP_BACKWARD)
                    .then(function (nextDocument) {
                    if (nextDocument == NO_MORE_BOOKMARKS) {
                        return;
                    }
                    // same document?
                    var activeDocument = Bookmarks.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
                    if (nextDocument.toString() == activeDocument) {
                        // revealLine(activeBookmark.bookmarks[0]);
                        revealLine(activeBookmark.bookmarks[activeBookmark.bookmarks.length - 1]);
                    }
                    else {
                        vscode.workspace.openTextDocument(nextDocument.toString()).then(function (doc) {
                            vscode.window.showTextDocument(doc).then(function (editor) {
                                // revealLine(activeBookmark.bookmarks[0]);
                                revealLine(activeBookmark.bookmarks[activeBookmark.bookmarks.length - 1]);
                            });
                        });
                    }
                })
                    .catch(function (error) {
                    vscode.window.showInformationMessage('No more bookmarks...');
                });
            }
            else {
                revealLine(parseInt(nextLine.toString()));
            }
        })
            .catch(function (error) {
            console.log('activeBookmark.nextBookmark REJECT' + error);
        });
    });
    vscode.commands.registerCommand('bookmarks.list', function () {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to list bookmarks');
            return;
        }
        // no bookmark
        if (activeBookmark.bookmarks.length == 0) {
            vscode.window.showInformationMessage("No Bookmark found");
            return;
        }
        // push the items
        var items = [];
        for (var index = 0; index < activeBookmark.bookmarks.length; index++) {
            var element = activeBookmark.bookmarks[index] + 1;
            var lineText = vscode.window.activeTextEditor.document.lineAt(element - 1).text;
            items.push({ label: element.toString(), description: lineText });
        }
        // pick one
        var currentLine = vscode.window.activeTextEditor.selection.active.line + 1;
        var options = {
            placeHolder: 'Type a line number or a piece of code to navigate to',
            matchOnDescription: true,
            onDidSelectItem: function (item) {
                revealLine(parseInt(item.label) - 1);
            }
        };
        vscode.window.showQuickPick(items, options).then(function (selection) {
            if (typeof selection == 'undefined') {
                revealLine(currentLine - 1);
                return;
            }
            revealLine(parseInt(selection.label) - 1);
        });
    });
    vscode.commands.registerCommand('bookmarks.listFromAllFiles', function () {
        // no bookmark
        var totalBookmarkCount = 0;
        for (var index_1 = 0; index_1 < bookmarks.bookmarks.length; index_1++) {
            totalBookmarkCount = totalBookmarkCount + bookmarks.bookmarks[index_1].bookmarks.length;
        }
        if (totalBookmarkCount == 0) {
            vscode.window.showInformationMessage("No Bookmarks found");
            return;
        }
        // push the items
        var items = [];
        var activeTextEditorPath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri.fsPath : '';
        var promisses = [];
        var currentLine = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.selection.active.line + 1 : -1;
        for (var index = 0; index < bookmarks.bookmarks.length; index++) {
            var bookmark = bookmarks.bookmarks[index];
            var pp = bookmark.listBookmarks();
            promisses.push(pp);
        }
        Promise.all(promisses).then(function (values) {
            for (var index = 0; index < values.length; index++) {
                var element = values[index];
                for (var indexInside = 0; indexInside < element.length; indexInside++) {
                    var elementInside = element[indexInside];
                    if (elementInside.detail.toString().toLowerCase() == activeTextEditorPath.toLowerCase()) {
                        items.push({
                            label: elementInside.label,
                            description: elementInside.description
                        });
                    }
                    else {
                        var itemPath = removeRootPathFrom(elementInside.detail);
                        items.push({
                            label: elementInside.label,
                            description: elementInside.description,
                            detail: itemPath
                        });
                    }
                }
            }
            // sort
            // - active document
            // - no octicon - document inside project
            // - with octicon - document outside project
            var itemsSorted;
            itemsSorted = items.sort(function (a, b) {
                if (!a.detail && !b.detail) {
                    return 0;
                }
                else {
                    if (!a.detail && b.detail) {
                        return -1;
                    }
                    else {
                        if (a.detail && !b.detail) {
                            return 1;
                        }
                        else {
                            if ((a.detail.toString().indexOf('$(file-directory) ') == 0) && (b.detail.toString().indexOf('$(file-directory) ') == -1)) {
                                return 1;
                            }
                            else {
                                if ((a.detail.toString().indexOf('$(file-directory) ') == -1) && (b.detail.toString().indexOf('$(file-directory) ') == 0)) {
                                    return -1;
                                }
                                else {
                                    return 0;
                                }
                            }
                        }
                    }
                }
            });
            var options = {
                placeHolder: 'Type a line number or a piece of code to navigate to',
                matchOnDescription: true,
                onDidSelectItem: function (item) {
                    var filePath;
                    // no detail - previously active document
                    if (!item.detail) {
                        filePath = activeTextEditorPath;
                    }
                    else {
                        // with octicon - document outside project
                        if (item.detail.toString().indexOf('$(file-directory) ') == 0) {
                            filePath = item.detail.toString().split('$(file-directory) ').pop();
                        }
                        else {
                            filePath = vscode.workspace.rootPath + item.detail.toString();
                        }
                    }
                    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath.toLowerCase() == filePath.toLowerCase()) {
                        revealLine(parseInt(item.label) - 1);
                    }
                    else {
                        var uriDocument = vscode.Uri.file(filePath);
                        vscode.workspace.openTextDocument(uriDocument).then(function (doc) {
                            vscode.window.showTextDocument(doc, undefined, true).then(function (editor) {
                                revealLine(parseInt(item.label) - 1);
                            });
                        });
                    }
                }
            };
            vscode.window.showQuickPick(itemsSorted, options).then(function (selection) {
                if (typeof selection == 'undefined') {
                    if (activeTextEditorPath == '') {
                        return;
                    }
                    else {
                        var uriDocument = vscode.Uri.file(activeTextEditorPath);
                        vscode.workspace.openTextDocument(uriDocument).then(function (doc) {
                            vscode.window.showTextDocument(doc).then(function (editor) {
                                revealLine(currentLine - 1);
                                return;
                            });
                        });
                    }
                }
                if (typeof selection == 'undefined') {
                    return;
                }
                if (!selection.detail) {
                    revealLine(parseInt(selection.label) - 1);
                }
                else {
                    var newPath = vscode.workspace.rootPath + selection.detail.toString();
                    var uriDocument = vscode.Uri.file(newPath);
                    vscode.workspace.openTextDocument(uriDocument).then(function (doc) {
                        vscode.window.showTextDocument(doc).then(function (editor) {
                            revealLine(parseInt(selection.label) - 1);
                        });
                    });
                }
            });
        });
    });
    function revealLine(line) {
        var reviewType = vscode.TextEditorRevealType.InCenter;
        if (line == vscode.window.activeTextEditor.selection.active.line) {
            reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
        }
        var newSe = new vscode.Selection(line, 0, line, 0);
        vscode.window.activeTextEditor.selection = newSe;
        vscode.window.activeTextEditor.revealRange(newSe, reviewType);
    }
    function loadWorkspaceState() {
        var saveBookmarksBetweenSessions = vscode.workspace.getConfiguration('bookmarks').get('saveBookmarksBetweenSessions', false);
        bookmarks = new Bookmarks('');
        var savedBookmarks = context.workspaceState.get('bookmarks', '');
        if (savedBookmarks != '') {
            bookmarks.loadFrom(JSON.parse(savedBookmarks));
        }
        return savedBookmarks != '';
    }
    function saveWorkspaceState() {
        var saveBookmarksBetweenSessions = vscode.workspace.getConfiguration('bookmarks').get('saveBookmarksBetweenSessions', false);
        if (!saveBookmarksBetweenSessions) {
            return;
        }
        context.workspaceState.update('bookmarks', JSON.stringify(bookmarks));
    }
    //............................................................................................
    // function used to attach bookmarks at the line
    function stickyBookmarks(event) {
        var useStickyBookmarks = vscode.workspace.getConfiguration('bookmarks').get('useStickyBookmarks', false);
        if (!useStickyBookmarks) {
            return false;
        }
        var diffLine;
        var updatedBookmark = false;
        if (event.contentChanges.length === 1) {
            // add or delete line case
            if (event.document.lineCount != activeEditorCountLine) {
                if (event.document.lineCount > activeEditorCountLine) {
                    diffLine = event.document.lineCount - activeEditorCountLine;
                }
                else if (event.document.lineCount < activeEditorCountLine) {
                    diffLine = activeEditorCountLine - event.document.lineCount;
                    diffLine = 0 - diffLine;
                    // one line up
                    if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line == 1) {
                        if ((event.contentChanges[0].range.end.character == 0) &&
                            (event.contentChanges[0].range.start.character == 0)) {
                            // the bookmarked one
                            var idxbk = activeBookmark.bookmarks.indexOf(event.contentChanges[0].range.start.line);
                            if (idxbk > -1) {
                                activeBookmark.bookmarks.splice(idxbk, 1);
                            }
                        }
                    }
                    if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line > 1) {
                        for (var i = event.contentChanges[0].range.start.line; i <= event.contentChanges[0].range.end.line; i++) {
                            var index = activeBookmark.bookmarks.indexOf(i);
                            if (index > -1) {
                                activeBookmark.bookmarks.splice(index, 1);
                                updatedBookmark = true;
                            }
                        }
                    }
                }
                for (var index in activeBookmark.bookmarks) {
                    var eventLine = event.contentChanges[0].range.start.line;
                    var eventcharacter = event.contentChanges[0].range.start.character;
                    // also =
                    if (((activeBookmark.bookmarks[index] > eventLine) && (eventcharacter > 0)) ||
                        ((activeBookmark.bookmarks[index] >= eventLine) && (eventcharacter == 0))) {
                        var newLine = activeBookmark.bookmarks[index] + diffLine;
                        if (newLine < 0) {
                            newLine = 0;
                        }
                        activeBookmark.bookmarks[index] = newLine;
                        updatedBookmark = true;
                    }
                }
            }
            // paste case
            if (event.contentChanges[0].text.length > 1) {
                var selection = vscode.window.activeTextEditor.selection;
                var lineRange = [selection.start.line, selection.end.line];
                var lineMin = Math.min.apply(this, lineRange);
                var lineMax = Math.max.apply(this, lineRange);
                if (selection.start.character > 0) {
                    lineMin++;
                }
                if (selection.end.character < vscode.window.activeTextEditor.document.lineAt(selection.end).range.end.character) {
                    lineMax--;
                }
                if (lineMin <= lineMax) {
                    for (var i = lineMin; i <= lineMax; i++) {
                        var index = activeBookmark.bookmarks.indexOf(i);
                        if (index > -1) {
                            activeBookmark.bookmarks.splice(index, 1);
                            updatedBookmark = true;
                        }
                    }
                }
            }
        }
        else if (event.contentChanges.length === 2) {
            // move line up and move line down case
            if (activeEditor.selections.length === 1) {
                if (event.contentChanges[0].text === '') {
                    updatedBookmark = moveStickyBookmarks('down');
                }
                else if (event.contentChanges[1].text === '') {
                    updatedBookmark = moveStickyBookmarks('up');
                }
            }
        }
        return updatedBookmark;
    }
    function moveStickyBookmarks(direction) {
        var diffChange = -1;
        var updatedBookmark = false;
        var diffLine;
        var selection = activeEditor.selection;
        var lineRange = [selection.start.line, selection.end.line];
        var lineMin = Math.min.apply(this, lineRange);
        var lineMax = Math.max.apply(this, lineRange);
        if (selection.end.character === 0 && !selection.isSingleLine) {
            var lineAt = activeEditor.document.lineAt(selection.end.line);
            var posMin = new vscode.Position(selection.start.line + 1, selection.start.character);
            var posMax = new vscode.Position(selection.end.line, lineAt.range.end.character);
            vscode.window.activeTextEditor.selection = new vscode.Selection(posMin, posMax);
            lineMax--;
        }
        if (direction === 'up') {
            diffLine = 1;
            var index = activeBookmark.bookmarks.indexOf(lineMin - 1);
            if (index > -1) {
                diffChange = lineMax;
                activeBookmark.bookmarks.splice(index, 1);
                updatedBookmark = true;
            }
        }
        else if (direction === 'down') {
            diffLine = -1;
            var index = void 0;
            index = activeBookmark.bookmarks.indexOf(lineMax + 1);
            if (index > -1) {
                diffChange = lineMin;
                activeBookmark.bookmarks.splice(index, 1);
                updatedBookmark = true;
            }
        }
        lineRange = [];
        for (var i = lineMin; i <= lineMax; i++) {
            lineRange.push(i);
        }
        lineRange = lineRange.sort();
        if (diffLine < 0) {
            lineRange = lineRange.reverse();
        }
        for (var i in lineRange) {
            var index = activeBookmark.bookmarks.indexOf(lineRange[i]);
            if (index > -1) {
                activeBookmark.bookmarks[index] -= diffLine;
                updatedBookmark = true;
            }
        }
        if (diffChange > -1) {
            activeBookmark.bookmarks.push(diffChange);
            updatedBookmark = true;
        }
        return updatedBookmark;
    }
    function removeRootPathFrom(path) {
        if (!vscode.workspace.rootPath) {
            return path;
        }
        if (path.indexOf(vscode.workspace.rootPath) == 0) {
            return path.split(vscode.workspace.rootPath).pop();
        }
        else {
            return '$(file-directory) ' + path;
        }
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map