"use strict";
var CommandHistory = (function () {
    function CommandHistory() {
        this.history = [];
    }
    CommandHistory.prototype.dispose = function () {
    };
    CommandHistory.prototype.enqueue = function (cmd, cwd) {
        var last = this.last();
        if (last == undefined || (last.cmd !== cmd || last.cwd !== cwd)) {
            this.history.push({ cmd: cmd, cwd: cwd });
        }
    };
    CommandHistory.prototype.commands = function () {
        return this.history;
    };
    CommandHistory.prototype.last = function () {
        if (this.history.length == 0) {
            return undefined;
        }
        return this.history[this.history.length - 1];
    };
    return CommandHistory;
}());
exports.CommandHistory = CommandHistory;
//# sourceMappingURL=history.js.map