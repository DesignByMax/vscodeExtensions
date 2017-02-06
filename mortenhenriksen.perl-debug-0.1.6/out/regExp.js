"use strict";
exports.colors = /\u001b\[([0-9]+)m|\u001b/g;
exports.db = /^DB\<\<?([0-9]+)\>?\>$/;
exports.restartWarning = /^Warning: some settings and command-line options may be lost!/;
exports.breakPoint = {
    // The condition my condition was in eg.:
    // '    break if (1)'
    condition: /^    break/,
    // This looks like a filename eg.:
    // 'test.pl:'
    filename: /^([a-zA-Z.\_\-0-9]+)\:$/,
    // Got a line nr eg.:
    // '5:\tprint "Testing\\n";'
    ln: /^ ([0-9]+):/,
};
function cleanLine(line) {
    return line.replace(exports.colors, '').replace(/\s|(\\b)/g, '').replace('\b', '');
}
exports.cleanLine = cleanLine;
function isGarbageLine(line) {
    return cleanLine(line) === '' || exports.lastCommandLine.test(line);
}
exports.isGarbageLine = isGarbageLine;
exports.lastCommandLine = {
    // Improve this function... I think the test is the issue
    test(line) {
        const stripped = cleanLine(line);
        // console.log(`${db.test(stripped)} DB: "${stripped}"`);
        /*const chars = new Array([...stripped]);
        console.log(`CHARS:`, chars);*/
        return exports.db.test(stripped);
    },
    match(line) {
        const stripped = cleanLine(line);
        return stripped.match(exports.db);
    }
};
exports.fileMatch = /^[a-zA-Z]+::\(([a-zA-Z\._-]+):([0-9]+)\):/;
exports.fileMatchException = /at ([a-zA-Z\._-]+) line ([0-9]+)\./;
exports.codeErrorSyntax = /^syntax error at (\S+) line ([0-9]+), near ([\S|\s]+)/;
exports.codeErrorRuntime = /([\S|\s]+) at (\S+) line ([0-9]+)\.$/;
// EG. PadWalker for scope investigation
exports.codeErrorMissingModule = /^(\S+) module not found - please install$/;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnRXhwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JlZ0V4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQWEsY0FBTSxHQUFHLDJCQUEyQixDQUFDO0FBQ3JDLFVBQUUsR0FBRyx3QkFBd0IsQ0FBQztBQUM5QixzQkFBYyxHQUFHLCtEQUErRCxDQUFDO0FBRWpGLGtCQUFVLEdBQUc7SUFDekIseUNBQXlDO0lBQ3pDLHFCQUFxQjtJQUNyQixTQUFTLEVBQUUsWUFBWTtJQUN2QixrQ0FBa0M7SUFDbEMsYUFBYTtJQUNiLFFBQVEsRUFBRSx5QkFBeUI7SUFDbkMscUJBQXFCO0lBQ3JCLDRCQUE0QjtJQUM1QixFQUFFLEVBQUUsYUFBYTtDQUNqQixDQUFBO0FBRUQsbUJBQTBCLElBQVk7SUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRmUsaUJBQVMsWUFFeEIsQ0FBQTtBQUVELHVCQUE4QixJQUFZO0lBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGZSxxQkFBYSxnQkFFNUIsQ0FBQTtBQUVZLHVCQUFlLEdBQUc7SUFDOUIseURBQXlEO0lBQ3pELElBQUksQ0FBQyxJQUFZO1FBQ2hCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyx5REFBeUQ7UUFFekQ7dUNBQytCO1FBRS9CLE1BQU0sQ0FBQyxVQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBWTtRQUNqQixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBRSxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNELENBQUM7QUFFVyxpQkFBUyxHQUFHLDJDQUEyQyxDQUFDO0FBRXhELDBCQUFrQixHQUFHLG9DQUFvQyxDQUFDO0FBRTFELHVCQUFlLEdBQUcsdURBQXVELENBQUM7QUFFMUUsd0JBQWdCLEdBQUcsc0NBQXNDLENBQUM7QUFFdkUsd0NBQXdDO0FBQzNCLDhCQUFzQixHQUFHLDJDQUEyQyxDQUFDIn0=