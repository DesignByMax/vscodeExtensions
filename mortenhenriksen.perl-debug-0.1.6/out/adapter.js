"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path_1 = require('path');
const child_process_1 = require('child_process');
const streamCatcher_1 = require('./streamCatcher');
const RX = require('./regExp');
const variableParser_1 = require('./variableParser');
function findFilenameLine(str) {
    // main::(test.pl:8):
    const fileMatch = str.match(RX.fileMatch);
    // at test.pl line 10
    const fileMatchException = str.match(RX.fileMatchException);
    return fileMatch || fileMatchException || [];
}
function variableType(key, val) {
    if (/^['|"]/.test(val)) {
        return 'string';
    }
    if (/^([0-9\,\.]+)$/) {
        return 'integer';
    }
    return 'Unknown';
}
function variableValue(val) {
    if (/^['|"]/.test(val)) {
        return val.replace(/^'/, '').replace(/'$/, '');
    }
    if (/^([0-9\,\.]+)$/) {
        return +val;
    }
    return val;
}
class perlDebuggerConnection {
    /**
     * Pass in the initial script and optional additional arguments for
     * running the script.
     */
    constructor() {
        this.debug = false;
        this.onOutput = null;
        this.onError = null;
        this.onClose = null;
        this.onException = null;
        this.onTermination = null;
        this.streamCatcher = new streamCatcher_1.StreamCatcher();
    }
    initializeRequest() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    logOutput(data) {
        if (typeof this.onOutput === 'function') {
            try {
                this.onOutput(data);
            }
            catch (err) {
                throw new Error(`Error in "onOutput" handler: ${err.message}`);
            }
        }
    }
    logData(prefix, data) {
        data.forEach((val, i) => {
            this.logOutput(`${prefix}${val}`);
        });
    }
    parseResponse(data) {
        const res = {
            data: [],
            orgData: data,
            ln: 0,
            errors: [],
            name: '',
            filename: '',
            exception: false,
            finished: false,
            command: '',
            db: '',
        };
        res.orgData.forEach((line, i) => {
            if (i === 0) {
                // Command line
                res.command = line;
            }
            else if (i === res.orgData.length - 1) {
                // DB
                const dbX = RX.lastCommandLine.match(line);
                if (dbX)
                    res.db = dbX[1];
            }
            else {
                // Contents
                line = line.replace(RX.colors, '');
                if (!RX.isGarbageLine(line)) {
                    res.data.push(line);
                }
                // Grap the last filename and line number
                const [, filename, ln] = findFilenameLine(line);
                if (filename) {
                    res.name = filename;
                    res.filename = path_1.join(this.filepath, filename);
                    res.ln = +ln;
                }
                // Check contents for issues
                if (/^exception/.test(line)) {
                }
                if (/^Debugged program terminated/.test(line)) {
                    res.finished = true;
                }
                if (/Use 'q' to quit or 'R' to restart\./.test(line)) {
                    res.finished = true;
                }
                if (/^Execution of (\S+) aborted due to compilation errors\.$/.test(line)) {
                    res.exception = true;
                }
                if (RX.codeErrorSyntax.test(line)) {
                    const parts = line.match(RX.codeErrorSyntax);
                    if (parts) {
                        res.errors.push({
                            name: parts[1],
                            filename: path_1.join(this.filepath, parts[1]),
                            ln: +parts[2],
                            message: line,
                            near: parts[3],
                            type: 'SYNTAX',
                        });
                    }
                }
                // Undefined subroutine &main::functionNotFound called at broken_code.pl line 10.
                if (RX.codeErrorRuntime.test(line)) {
                    res.exception = true;
                    const parts = line.match(RX.codeErrorRuntime);
                    if (parts) {
                        res.errors.push({
                            name: parts[2],
                            filename: path_1.join(this.filepath, parts[2]),
                            ln: +parts[3],
                            message: line,
                            near: parts[1],
                            type: 'RUNTIME',
                        });
                    }
                }
            }
        });
        if (res.exception) {
            if (typeof this.onException === 'function') {
                try {
                    this.onException(res);
                }
                catch (err) {
                    throw new Error(`Error in "onException" handler: ${err.message}`);
                }
            }
        }
        if (res.finished) {
            if (typeof this.onTermination === 'function') {
                try {
                    this.onTermination(res);
                }
                catch (err) {
                    throw new Error(`Error in "onTermination" handler: ${err.message}`);
                }
            }
        }
        if (this.debug)
            console.log(res);
        if (res.exception) {
            throw res;
        }
        return res;
    }
    launchRequest(filename, filepath, args = [], options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.filename = filename;
            this.filepath = filepath;
            this.currentfile = filename;
            const sourceFile = path_1.join(filepath, filename);
            if (this.debug)
                console.log(`Platform: ${process.platform}`);
            if (this.debug)
                console.log(`Launch "perl -d ${sourceFile}" in "${filepath}"`);
            const perlCommand = options.exec || 'perl';
            const commandArgs = [].concat(args, ['-d', filename]);
            this.logOutput(`${perlCommand} ${commandArgs.join(' ')}`);
            // xxx: add failure handling
            this.perlDebugger = child_process_1.spawn(perlCommand, commandArgs, {
                detached: true,
                cwd: filepath,
                env: {
                    COLUMNS: 80,
                    LINES: 25,
                    TERM: 'dumb',
                    PATH: process.env.PATH || '',
                    PERL5OPT: process.env.PERL5OPT || '',
                },
            });
            this.perlDebugger.on('error', (err) => {
                if (this.debug)
                    console.log('error:', err);
                this.logOutput(`Error`);
                this.logOutput(err);
            });
            this.streamCatcher.launch(this.perlDebugger.stdin, this.perlDebugger.stderr);
            // this.streamCatcher.debug = this.debug;
            // Handle program output
            this.perlDebugger.stdout.on('data', (buffer) => {
                const data = buffer.toString().split('\n');
                this.logData('', data); // xxx: Program output, better formatting/colors?
            });
            this.perlDebugger.on('close', (code) => {
                if (this.streamCatcher.ready) {
                    this.logOutput(`Debugger connection closed`);
                }
                else {
                    this.logOutput(`Could not connect to debugger, connection closed`);
                }
                if (typeof this.onClose === 'function') {
                    try {
                        this.onClose(code);
                    }
                    catch (err) {
                        throw new Error(`Error in "onClose" handler: ${err.message}`);
                    }
                }
            });
            // Depend on the data dumper for the watcher
            // await this.streamCatcher.request('use Data::Dumper');
            // Listen for a ready signal
            const data = yield this.streamCatcher.isReady();
            this.logData('', data.slice(0, data.length - 2));
            try {
                // Get the version just after
                this.perlVersion = yield this.getPerlVersion();
            }
            catch (ignore) {
            }
            return this.parseResponse(data);
        });
    }
    request(command) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.streamCatcher.isReady();
            return this.parseResponse(yield this.streamCatcher.request(command));
        });
    }
    relativePath(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.streamCatcher.isReady();
            return filename && filename.replace(`${this.filepath}/`, '');
        });
    }
    setFileContext(filename = this.filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.request(`print STDERR "${filename}"`);
            const res = yield this.request(`f ${filename}`);
            if (res.data.length) {
                // if (/Already in/.test)
                if (/^No file matching/.test(res.data[0])) {
                    throw new Error(res.data[0]);
                }
            }
            this.currentfile = filename;
            return res;
        });
    }
    setBreakPoint(ln, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // xxx: We call `b ${filename}:${ln}` but this will not complain
            // about files not found - this might be ok for now
            // await this.setFileContext(filename);
            // const command = filename ? `b ${filename}:${ln}` : `b ${ln}`;
            // const res = await this.request(`b ${ln}`);
            return Promise.all([this.setFileContext(filename), this.request(`b ${ln}`)])
                .then(result => {
                const res = result.pop();
                if (this.debug)
                    console.log(res);
                if (res.data.length) {
                    if (/not breakable\.$/.test(res.data[0])) {
                        throw new Error(res.data[0] + ' ' + filename + ':' + ln);
                    }
                    if (/not found\.$/.test(res.data[0])) {
                        throw new Error(res.data[0] + ' ' + filename + ':' + ln);
                    }
                }
                return res;
            });
        });
    }
    getBreakPoints() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request(`L b`);
            const breakpoints = {};
            if (this.debug)
                console.log(res);
            let currentFile = 'unknown';
            res.data.forEach(line => {
                if (RX.breakPoint.condition.test(line)) {
                }
                else if (RX.breakPoint.ln.test(line)) {
                    const lnX = line.match(RX.breakPoint.ln);
                    if (breakpoints[currentFile] && lnX) {
                        const ln = +lnX[1];
                        if (lnX[1] === `${ln}`) {
                            breakpoints[currentFile].push(ln);
                        }
                    }
                }
                else if (RX.breakPoint.filename.test(line)) {
                    currentFile = line.replace(/:$/, '');
                    if (this.debug)
                        console.log('GOT FILENAME:', currentFile);
                    if (typeof breakpoints[currentFile] === 'undefined') {
                        breakpoints[currentFile] = [];
                    }
                }
                else {
                }
            });
            if (this.debug)
                console.log('BREAKPOINTS:', breakpoints);
            return breakpoints;
        });
    }
    clearBreakPoint(ln, filename) {
        // xxx: We call `B ${filename}:${ln}` but this will not complain
        // about files not found - not sure if it's a bug or not but
        // the perl debugger will change the main filename to filenames
        // not found - a bit odd
        // await this.setFileContext(filename);
        // const command = filename ? `B ${filename}:${ln}` : `B ${ln}`;
        return Promise.all([this.setFileContext(filename), this.request(`B ${ln}`)])
            .then(results => results.pop());
    }
    clearAllBreakPoints() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('B *');
        });
    }
    continue() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('c');
        });
    }
    // Next:
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('n');
        });
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            // xxx: We might need to respawn on windows
            return yield this.request('R');
        });
    }
    getVariableReference(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request(`print STDERR \\${name}`);
            return res.data[0];
        });
    }
    getExpressionValue(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request(`print STDERR ${expression}`);
            return res.data.pop();
        });
    }
    /**
     * Prints out a nice indent formatted list of variables with
     * array references resolved.
     */
    requestVariableOutput(level) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = [];
            // xxx: There seem to be an issue in perl debug or PadWalker in/outside these versions on linux
            const isBrokenLinux = process.platform === 'linux' && (this.perlVersion >= '5.022000' || this.perlVersion < '5.018000');
            const isBrokenWindows = /^win/.test(process.platform);
            const fixLevel = isBrokenLinux || isBrokenWindows;
            const res = yield this.request(`y ${fixLevel ? level - 1 : level}`);
            const result = [];
            if (/^Not nested deeply enough/.test(res.data[0])) {
                return [];
            }
            if (RX.codeErrorMissingModule.test(res.data[0])) {
                throw new Error(res.data[0]);
            }
            // Resolve all Array references
            for (let i = 0; i < res.data.length; i++) {
                const line = res.data[i];
                if (/\($/.test(line)) {
                    const name = line.split(' = ')[0];
                    const reference = yield this.getVariableReference(name);
                    result.push(`${name} = ${reference}`);
                }
                else if (line !== ')') {
                    result.push(line);
                }
            }
            return result;
        });
    }
    getVariableList(level, scopeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const variableOutput = yield this.requestVariableOutput(level);
            //console.log('RESOLVED:');
            //console.log(variableOutput);
            return variableParser_1.default(variableOutput, scopeName);
        });
    }
    variableList(scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.keys(scopes);
            let result = {};
            for (let i = 0; i < keys.length; i++) {
                const name = keys[i];
                const level = scopes[name];
                Object.assign(result, yield this.getVariableList(level, name));
            }
            return result;
        });
    }
    getStackTrace() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request('T');
            const result = [];
            res.data.forEach((line, i) => {
                // > @ = DB::DB called from file 'lib/Module2.pm' line 5
                // > . = Module2::test2() called from file 'test.pl' line 12
                const m = line.match(/^(\S+) = (\S+) called from file \'(\S+)\' line ([0-9]+)$/);
                if (m !== null) {
                    const [, v, caller, name, ln] = m;
                    const filename = path_1.join(this.filepath, name);
                    result.push({
                        v,
                        name,
                        filename,
                        caller,
                        ln: +ln,
                    });
                }
            });
            return result;
        });
    }
    watchExpression(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            // Brute force this a bit...
            return Promise.all([
                this.request(`W ${expression}`),
                this.request(`w ${expression}`),
            ])
                .then(res => res.pop());
        });
    }
    clearAllWatchers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('W *');
        });
    }
    getPerlVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request('p $]');
            return res.data[0];
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.perlDebugger) {
                this.streamCatcher.destroy();
                this.perlDebugger.kill();
                this.perlDebugger = null;
            }
        });
    }
}
exports.perlDebuggerConnection = perlDebuggerConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHVCQUFtQixNQUFNLENBQUMsQ0FBQTtBQUMxQixnQ0FBb0IsZUFBZSxDQUFDLENBQUE7QUFDcEMsZ0NBQTRCLGlCQUFpQixDQUFDLENBQUE7QUFDOUMsTUFBWSxFQUFFLFdBQU0sVUFBVSxDQUFDLENBQUE7QUFDL0IsaUNBQW9FLGtCQUFrQixDQUFDLENBQUE7QUFrQ3ZGLDBCQUEwQixHQUFXO0lBQ3BDLHFCQUFxQjtJQUNyQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxxQkFBcUI7SUFDckIsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRTVELE1BQU0sQ0FBQyxTQUFTLElBQUksa0JBQWtCLElBQUksRUFBRSxDQUFDO0FBQzlDLENBQUM7QUFFRCxzQkFBc0IsR0FBVyxFQUFFLEdBQVc7SUFDN0MsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbEIsQ0FBQztBQUVELHVCQUF1QixHQUFXO0lBQ2pDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENB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