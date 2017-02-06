/**
 * This file contains the stream catcher
 * it's basically given an input and out stream
 * it takes requests and generates a response from the streams
 */
"use strict";
const RX = require('./regExp');
class StreamCatcher {
    constructor() {
        this.debug = false;
        this.requestQueue = [];
        this.requestRunning = null;
        this.buffer = [''];
        // xxx: consider removing ready - the user should not have to care about that...
        this.ready = false;
        this.readyListeners = [];
        // Listen for a ready signal
        const result = this.request(null)
            .then((res) => {
            if (this.debug)
                console.log('ready', res);
            this.readyResponse = res;
            this.ready = true;
            this.readyListeners.forEach(f => f(res));
        });
    }
    launch(input, output) {
        this.input = input;
        let lastBuffer = '';
        let timeout = null;
        output.on('data', (buffer) => {
            if (this.debug)
                console.log('RAW:', buffer.toString());
            const data = lastBuffer + buffer.toString();
            const lines = data.split(/\r\n|\r|\n/);
            const firstLine = lines[0];
            const lastLine = lines[lines.length - 1];
            const commandIsDone = RX.lastCommandLine.test(lastLine);
            // xxx: Windows restart workaround
            // the windows perl debugger doesn't end the current restart request so we have to
            // simulate a proper request end.
            if ((/^win/.test(process.platform) && RX.restartWarning.test(firstLine)) || timeout) {
                if (this.debug && RX.restartWarning.test(firstLine))
                    console.log('RAW> Waiting to fake end of restart request');
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                    timeout = null;
                    if (this.requestRunning) {
                        if (this.debug)
                            console.log('RAW> Fake end of restart request');
                        // xxx: We might want to simulate all the restart output
                        this.readline('   DB<0> ');
                    }
                }, 500);
            }
            if (/\r\n|\r|\n$/.test(data) || commandIsDone) {
                lastBuffer = '';
            }
            else {
                lastBuffer = lines.pop();
            }
            lines.forEach(line => this.readline(line));
        });
        output.on('close', () => {
            // xxx: Windows perl debugger just exits on syntax error without "DB<n>"
            // If theres stuff left in the buffer we push it and end the request.
            if (this.requestRunning) {
                if (this.debug)
                    console.log('RAW> Fake end of request');
                this.readline(lastBuffer);
                this.readline('Debugged program terminated.  Use q to quit or R to restart,');
                this.readline('use o inhibit_exit to avoid stopping after program termination,');
                this.readline('h q, h R or h o to get additional info.');
                this.readline('   DB<0> ');
            }
        });
    }
    readline(line) {
        if (this.debug)
            console.log('line:', line);
        // if (this.debug) console.log('data:', [...line]);
        this.buffer.push(line);
        // Test for command end
        if (RX.lastCommandLine.test(line)) {
            if (this.debug)
                console.log('END:', line);
            const data = this.buffer;
            this.buffer = [];
            // xxx: We might want to verify the DB nr and the cmd number
            this.resolveRequest(data);
        }
    }
    resolveRequest(data) {
        const req = this.requestRunning;
        if (req) {
            if (req.command) {
                data.unshift(req.command);
            }
            req.resolve(data);
            // Reset state making room for next task
            this.buffer = [];
            this.requestRunning = null;
        }
        this.nextRequest();
    }
    nextRequest() {
        if (!this.requestRunning && this.requestQueue.length) {
            // Set new request
            this.requestRunning = this.requestQueue.shift();
            // this.logOutput(`NEXT: ${this.requestRunning.command}\n`);
            // a null command is used for the initial run, in that case we don't need to
            // do anything but listen
            if (this.requestRunning.command !== null) {
                this.input.write(`${this.requestRunning.command}\n`);
            }
        }
    }
    request(command) {
        if (this.debug)
            console.log(command ? `CMD: "${command}"` : 'REQ-INIT');
        return new Promise((resolve, reject) => {
            // Add our request to the queue
            this.requestQueue.push({
                command,
                resolve,
                reject
            });
            this.nextRequest();
        });
    }
    onReady(f) {
        if (this.ready) {
            f(this.readyResponse);
        }
        else {
            this.readyListeners.push(f);
        }
    }
    isReady() {
        return new Promise(resolve => this.onReady(res => resolve(res)));
    }
    destroy() {
        return Promise.resolve();
    }
}
exports.StreamCatcher = StreamCatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtQ2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHJlYW1DYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7O0FBR0gsTUFBWSxFQUFFLFdBQU0sVUFBVSxDQUFDLENBQUE7QUFRL0I7SUFjQztRQWJPLFVBQUssR0FBWSxLQUFLLENBQUM7UUFDdEIsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLG1CQUFjLEdBQXVCLElBQUksQ0FBQztRQUUxQyxXQUFNLEdBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVoQyxnRkFBZ0Y7UUFDekUsVUFBSyxHQUFZLEtBQUssQ0FBQztRQUN0QixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQU0xQiw0QkFBNEI7UUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDL0IsSUFBSSxDQUFDLENBQUMsR0FBRztZQUNULEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRU4sQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFlLEVBQUUsTUFBZ0I7UUFDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksT0FBTyxHQUF3QixJQUFJLENBQUM7UUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNO1lBQ3hC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