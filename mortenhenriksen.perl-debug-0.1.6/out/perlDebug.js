/// <reference types="node" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode_debugadapter_1 = require('vscode-debugadapter');
const fs_1 = require('fs');
const path_1 = require('path');
const adapter_1 = require('./adapter');
const variableParser_1 = require('./variableParser');
class PerlDebugSession extends vscode_debugadapter_1.DebugSession {
    constructor() {
        super();
        this._breakpointId = 1000;
        // This is the next line that will be 'executed'
        this.__currentLine = 0;
        this._sourceLines = new Array();
        this._breakPoints = new Map();
        this._functionBreakPoints = [];
        this._variableHandles = new vscode_debugadapter_1.Handles();
        this.perlDebugger = new adapter_1.perlDebuggerConnection();
        this.rootPath = '';
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }
    get _currentLine() {
        return this.__currentLine;
    }
    set _currentLine(line) {
        this.__currentLine = line;
    }
    /* protected convertClientPathToDebugger(clientPath: string): string {
         return clientPath.replace(this.rootPath, '');
     }
 
     protected convertDebuggerPathToClient(debuggerPath: string): string {
         return join(this.rootPath, debuggerPath);
     }*/
    initializeRequest(response, args) {
        // Rig output
        this.perlDebugger.onOutput = (text) => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`${text}\n`));
        };
        this.perlDebugger.onException = (res) => {
            // xxx: for now I need more info, code to go away...
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent("exception", PerlDebugSession.THREAD_ID));
        };
        this.perlDebugger.onTermination = (res) => {
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        };
        this.perlDebugger.onClose = (code) => {
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        };
        this.perlDebugger.initializeRequest()
            .then(() => {
            // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
            // we request them early by sending an 'initializeRequest' to the frontend.
            // The frontend will end the configuration sequence by calling 'configurationDone' request.
            this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
            // This debug adapter implements the configurationDoneRequest.
            response.body.supportsConfigurationDoneRequest = true;
            // make VS Code to use 'evaluate' when hovering over source
            response.body.supportsEvaluateForHovers = true;
            // make VS Code to show a 'step back' button
            response.body.supportsStepBack = false;
            response.body.supportsFunctionBreakpoints = false;
            this.sendResponse(response);
        });
    }
    launchRequest(response, args) {
        this.rootPath = args.root;
        this._sourceFile = args.program;
        this._sourceLines = fs_1.readFileSync(this._sourceFile).toString().split('\n');
        this.filename = path_1.basename(this._sourceFile);
        this.filepath = path_1.dirname(this._sourceFile);
        const inc = args.inc && args.inc.length ? args.inc.map(directory => `-I${directory}`) : [];
        this.perlDebugger.launchRequest(this.filename, this.filepath, inc, { exec: args.exec })
            .then((res) => {
            if (args.stopOnEntry) {
                if (res.ln) {
                    this._currentLine = res.ln - 1;
                }
                this.sendResponse(response);
                // we stop on the first line
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", PerlDebugSession.THREAD_ID));
            }
            else {
                // we just start to run until we hit a breakpoint or an exception
                this.continueRequest(response, { threadId: PerlDebugSession.THREAD_ID });
            }
        });
    }
    threadsRequest(response) {
        // xxx: Not sure if this is sufficient to levarage multi cores?
        // return the default thread
        response.body = {
            threads: [
                new vscode_debugadapter_1.Thread(PerlDebugSession.THREAD_ID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }
    /**
     * TODO
     *
     * if possible:
     *
     * * step out
     * * step back
     * * reverse continue
     */
    /**
     * Reverse continue
     */
    reverseContinueRequest(response, args) {
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>Reverse continue not implemented\n\n`));
        this.sendResponse(response);
        // no more lines: stop at first line
        this._currentLine = 0;
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", PerlDebugSession.THREAD_ID));
    }
    /**
     * Step back
     */
    stepBackRequest(response, args) {
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>Step back not implemented\n`));
        this.sendResponse(response);
        // no more lines: stop at first line
        this._currentLine = 0;
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", PerlDebugSession.THREAD_ID));
    }
    pauseRequest(response, args) {
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>pause not implemented\n`));
        this.sendResponse(response);
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("breakpoint", PerlDebugSession.THREAD_ID));
    }
    setFunctionBreakPointsRequestAsync(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const breakpoints = [];
            const newBreakpoints = args.breakpoints.map(bp => { return bp.name; });
            const neoBreakpoints = [];
            for (var i = 0; i < this._functionBreakPoints.length; i++) {
                const name = this._functionBreakPoints[i];
                if (newBreakpoints.indexOf(name) < 0) {
                    this.sendEvent(new vscode_debugadapter_1.OutputEvent(`Remove ${name}\n`));
                    yield this.perlDebugger.request(`B ${name}`);
                }
            }
            for (var i = 0; i < args.breakpoints.length; i++) {
                const bp = args.breakpoints[i];
                if (this._functionBreakPoints.indexOf(bp.name) < 0) {
                    breakpoints.push(bp.name);
                    const res = yield this.perlDebugger.request(`b ${bp.name}`);
                    this.sendEvent(new vscode_debugadapter_1.OutputEvent(`Add ${bp.name}\n`));
                    const neoBreakpoint = { name: bp.name };
                    neoBreakpoints.push(neoBreakpoint);
                    response.body.breakpoints = [new vscode_debugadapter_1.Breakpoint(true, 4, 0, new vscode_debugadapter_1.Source('Module.pm', path_1.join(this.filepath, 'Module.pm')))];
                    this.sendResponse(response);
                    this.sendEvent(new vscode_debugadapter_1.OutputEvent(`Add ${bp.name}\n`));
                }
                else {
                    neoBreakpoints.push(bp);
                }
            }
            this._functionBreakPoints = breakpoints;
            return response;
        });
    }
    setFunctionBreakPointsRequest(response, args) {
        this.setFunctionBreakPointsRequestAsync(response, args)
            .then(res => {
            this.sendResponse(response);
        })
            .catch(err => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>setFunctionBreakPointsRequest error: ${err.message}\n`));
            this.sendResponse(response);
        });
    }
    /**
     * Implemented
     */
    /**
     * Set variable
     */
    setVariableRequest(response, args) {
        // Get type of variable contents
        const name = this.getVariableName(args.name, args.variablesReference)
            .then((variableName) => {
            return this.perlDebugger.request(`${variableName}='${args.value}'`)
                .then(() => {
                response.body = {
                    value: args.value,
                    type: variableParser_1.variableType(args.value),
                };
                this.sendResponse(response);
            });
        })
            .catch((err) => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>setVariableRequest error: ${err.message}\n`));
            this.sendResponse(response);
        });
    }
    /**
     * Step out
     */
    stepOutRequest(response, args) {
        this.perlDebugger.request('r')
            .then((res) => {
            if (res.ln) {
                this._currentLine = this.convertDebuggerLineToClient(res.ln);
            }
            this.sendResponse(response);
            if (res.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("step", PerlDebugSession.THREAD_ID));
            }
            // no more lines: run to end
        })
            .catch(err => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>StepOut error: ${err.message}\n`));
            this.sendResponse(response);
            if (err.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
        });
    }
    /**
     * Step in
     */
    stepInRequest(response, args) {
        this.perlDebugger.request('s')
            .then((res) => {
            if (res.ln) {
                this._currentLine = this.convertDebuggerLineToClient(res.ln);
            }
            this.sendResponse(response);
            if (res.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("step", PerlDebugSession.THREAD_ID));
            }
            // no more lines: run to end
        })
            .catch(err => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>StepIn error: ${err.message}\n`));
            this.sendResponse(response);
            if (err.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
        });
    }
    /**
     * Restart
     */
    restartRequestAsync(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.perlDebugger.request('R');
            if (res.ln) {
                this._currentLine = this.convertDebuggerLineToClient(res.ln);
            }
            if (res.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", PerlDebugSession.THREAD_ID));
            }
            return response;
        });
    }
    restartRequest(response, args) {
        this.restartRequestAsync(response, args)
            .then(res => this.sendResponse(res))
            .catch(err => this.sendResponse(response));
    }
    /**
     * Breakpoints
     */
    setBreakPointsRequestAsync(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            var path = args.source.path;
            var clientLines = args.lines;
            const debugPath = yield this.perlDebugger.relativePath(path);
            const editorExisting = this._breakPoints.get(path);
            const editorBPs = args.lines.map(ln => ln);
            const dbp = yield this.perlDebugger.getBreakPoints();
            const debuggerPBs = (yield this.perlDebugger.getBreakPoints())[debugPath] || [];
            const createBP = [];
            const removeBP = [];
            var breakpoints = new Array();
            // Clean up debugger removing unset bps
            for (let i = 0; i < debuggerPBs.length; i++) {
                const ln = debuggerPBs[i];
                if (editorBPs.indexOf(ln) < 0) {
                    yield this.perlDebugger.clearBreakPoint(ln, debugPath);
                }
            }
            // Add missing bps to the debugger
            for (let i = 0; i < editorBPs.length; i++) {
                const ln = editorBPs[i];
                if (debuggerPBs.indexOf(ln) < 0) {
                    try {
                        const res = yield this.perlDebugger.setBreakPoint(ln, debugPath);
                        const bp = new vscode_debugadapter_1.Breakpoint(true, ln);
                        bp.id = this._breakpointId++;
                        breakpoints.push(bp);
                    }
                    catch (err) {
                        const bp = new vscode_debugadapter_1.Breakpoint(false, ln);
                        bp.id = this._breakpointId++;
                        breakpoints.push(bp);
                    }
                }
                else {
                    // This is good
                    const bp = new vscode_debugadapter_1.Breakpoint(true, ln);
                    bp.id = this._breakpointId++;
                    breakpoints.push(bp);
                }
            }
            this._breakPoints.set(path, breakpoints);
            // send back the actual breakpoint positions
            response.body = {
                breakpoints: breakpoints
            };
            return response;
        });
    }
    setBreakPointsRequest(response, args) {
        this.setBreakPointsRequestAsync(response, args)
            .then(res => this.sendResponse(res))
            .catch(err => this.sendResponse(response));
    }
    /**
     * Next
     */
    nextRequest(response, args) {
        this.perlDebugger.request('n')
            .then((res) => {
            if (res.ln) {
                this._currentLine = this.convertDebuggerLineToClient(res.ln);
            }
            this.sendResponse(response);
            if (res.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("step", PerlDebugSession.THREAD_ID));
            }
            // no more lines: run to end
        })
            .catch(err => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>Continue error: ${err.message}\n`));
            this.sendResponse(response);
            if (err.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
        });
    }
    /**
     * Continue
     */
    continueRequest(response, args) {
        this.perlDebugger.request('c')
            .then((res) => {
            if (res.ln) {
                this._currentLine = this.convertDebuggerLineToClient(res.ln);
            }
            this.sendResponse(response);
            if (res.finished) {
                this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("breakpoint", PerlDebugSession.THREAD_ID));
            }
        })
            .catch((err) => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`ERR>Continue error: ${err.message}\n`));
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
            this.sendResponse(response);
        });
    }
    /**
     * Scope request
     */
    scopesRequest(response, args) {
        const frameReference = args.frameId;
        const scopes = new Array();
        scopes.push(new vscode_debugadapter_1.Scope("Local", this._variableHandles.create("local_" + frameReference), false));
        scopes.push(new vscode_debugadapter_1.Scope("Closure", this._variableHandles.create("closure_" + frameReference), false));
        scopes.push(new vscode_debugadapter_1.Scope("Global", this._variableHandles.create("global_" + frameReference), true));
        response.body = {
            scopes: scopes
        };
        this.sendResponse(response);
    }
    getVariableName(name, variablesReference) {
        let id = this._variableHandles.get(variablesReference);
        return this.perlDebugger.variableList({
            global_0: 0,
            local_0: 1,
            closure_0: 2,
        })
            .then(variables => {
            return variableParser_1.resolveVariable(name, id, variables);
        });
    }
    /**
     * Variable scope
     */
    variablesRequest(response, args) {
        const id = this._variableHandles.get(args.variablesReference);
        this.perlDebugger.variableList({
            global_0: 0,
            local_0: 1,
            closure_0: 2,
        })
            .then(variables => {
            const result = [];
            if (id != null && variables[id]) {
                const len = variables[id].length;
                const result = variables[id].map(variable => {
                    // Convert the parsed variablesReference into Variable complient references
                    if (variable.variablesReference === '0') {
                        variable.variablesReference = 0;
                    }
                    else {
                        variable.variablesReference = this._variableHandles.create(`${variable.variablesReference}`);
                    }
                    return variable;
                });
                response.body = {
                    variables: result
                };
                this.sendResponse(response);
            }
            else {
                this.sendResponse(response);
            }
        })
            .catch(() => {
            this.sendResponse(response);
        });
    }
    /**
     * Evaluate hover
     */
    evaluateHover(response, args) {
        if (/^[\$|\@]/.test(args.expression)) {
            const expression = args.expression.replace(/\.(\'\w+\'|\w+)/g, (...a) => `->{${a[1]}}`);
            this.perlDebugger.getExpressionValue(expression)
                .then(result => {
                if (/^HASH/.test(result)) {
                    response.body = {
                        result: result,
                        variablesReference: this._variableHandles.create(result),
                        type: 'string'
                    };
                }
                else {
                    response.body = {
                        result: result,
                        variablesReference: 0
                    };
                }
                this.sendResponse(response);
            })
                .catch(() => {
                response.body = {
                    result: undefined,
                    variablesReference: 0
                };
                this.sendResponse(response);
            });
        }
        else {
            this.sendResponse(response);
        }
    }
    /**
     * Evaluate command line
     */
    evaluateCommandLine(response, args) {
        this.perlDebugger.request(args.expression)
            .then((res) => {
            if (res.data.length > 1) {
                res.data.forEach((line) => {
                    this.sendEvent(new vscode_debugadapter_1.OutputEvent(`> ${line}\n`));
                });
                response.body = {
                    result: `Result:`,
                    variablesReference: 0,
                };
            }
            else {
                response.body = {
                    result: `${res.data[0]}`,
                    variablesReference: 0
                };
            }
            this.sendResponse(response);
        });
    }
    ;
    /**
     * Fetch expression value
     */
    fetchExpressionRequest(clientExpression) {
        return __awaiter(this, void 0, void 0, function* () {
            const isVariable = /^([\$|@|%])([a-zA-Z0-9_\'\.]+)$/.test(clientExpression);
            const expression = isVariable ? clientExpression.replace(/\.(\'\w+\'|\w+)/g, (...a) => `->{${a[1]}}`) : clientExpression;
            let value = yield this.perlDebugger.getExpressionValue(expression);
            if (/^Can\'t use an undefined value as a HASH reference/.test(value)) {
                value = undefined;
            }
            const reference = isVariable ? yield this.perlDebugger.getVariableReference(expression) : null;
            if (typeof value !== 'undefined' && /^HASH|ARRAY/.test(reference)) {
                return {
                    value: reference,
                    reference: reference,
                };
            }
            return {
                value: value,
                reference: null,
            };
        });
    }
    /**
     * Evaluate watch
     * Note: We don't actually levarage the debugger watch capabilities yet
     */
    evaluateWatch(response, args) {
        // Clear watch if last request wasn't setting a watch?
        this.fetchExpressionRequest(args.expression)
            .then(result => {
            // this.sendEvent(new OutputEvent(`${args.expression}=${result.value} ${typeof result.value} ${result.reference}$')\n`));
            if (typeof result.value !== 'undefined') {
                response.body = {
                    result: result.value,
                    variablesReference: result.reference === null ? 0 : this._variableHandles.create(result.reference),
                };
            }
            this.sendResponse(response);
        })
            .catch(() => { });
    }
    /**
     * Evaluate
     */
    evaluateRequest(response, args) {
        if (args.context === 'repl') {
            this.evaluateCommandLine(response, args);
        }
        else if (args.context === 'hover') {
            this.evaluateHover(response, args);
        }
        else if (args.context === 'watch') {
            this.evaluateWatch(response, args);
        }
        else {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`evaluate(context: '${args.context}', '${args.expression}')`));
            response.body = {
                result: `evaluate(context: '${args.context}', '${args.expression}')`,
                variablesReference: 0
            };
            this.sendResponse(response);
        }
    }
    /**
     * Stacktrace
     */
    stackTraceRequestAsync(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const stacktrace = yield this.perlDebugger.getStackTrace();
            const frames = new Array();
            stacktrace.forEach((trace, i) => {
                frames.push(new vscode_debugadapter_1.StackFrame(i, `${trace.caller}`, new vscode_debugadapter_1.Source(path_1.basename(trace.filename), this.convertDebuggerPathToClient(trace.filename)), trace.ln, 0));
            });
            response.body = {
                stackFrames: frames,
                totalFrames: frames.length
            };
            return response;
        });
    }
    stackTraceRequest(response, args) {
        this.stackTraceRequestAsync(response, args)
            .then(res => this.sendResponse(res))
            .catch(err => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`--->Trace error...${err.message}\n`));
            response.body = {
                stackFrames: [],
                totalFrames: 0
            };
            this.sendResponse(response);
        });
    }
}
PerlDebugSession.THREAD_ID = 1;
vscode_debugadapter_1.DebugSession.run(PerlDebugSession);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybERlYnVnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BlcmxEZWJ1Zy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw4QkFBOEI7Ozs7Ozs7Ozs7QUFFOUIsc0NBSU8scUJBQXFCLENBQUMsQ0FBQTtBQUU3QixxQkFBMkIsSUFBSSxDQUFDLENBQUE7QUFDaEMsdUJBQXNDLE1BQU0sQ0FBQyxDQUFBO0FBRTdDLDBCQUF1QyxXQUFXLENBQUMsQ0FBQTtBQUNuRCxpQ0FBbUYsa0JBQWtCLENBQUMsQ0FBQTtBQWtCdEcsK0JBQStCLGtDQUFZO0lBMkIxQztRQUNDLE9BQU8sQ0FBQztRQXpCRCxrQkFBYSxHQUFHLElBQUksQ0FBQztRQUU3QixnREFBZ0Q7UUFDeEMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFZbEIsaUJBQVksR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1FBRW5DLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDN0QseUJBQW9CLEdBQWEsRUFBRSxDQUFDO1FBRXBDLHFCQUFnQixHQUFHLElBQUksNkJBQU8sRUFBVSxDQUFDO1FBRXpDLGlCQUFZLEdBQUcsSUFBSSxnQ0FBc0IsRUFBRSxDQUFDO1FBUzVDLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFKN0IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBekJELElBQVksWUFBWTtRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUN4QixDQUFDO0lBQ0osSUFBWSxZQUFZLENBQUMsSUFBWTtRQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0lBd0JDOzs7Ozs7UUFNQztJQUVPLGlCQUFpQixDQUFDLFFBQTBDLEVBQUUsSUFBOEM7UUFDckgsYUFBYTtRQUNiLElBQUksQ0FBQyxZQUFZ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