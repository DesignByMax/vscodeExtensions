/*

{
    'HASH(0x7f92619e1b00)': [
        {
            name: 'bar',
            value: 12,
            type: 'integer',
            variablesReference: 0,
        }
    ]
    0: [
        {
            name: '$hello',
            value: 'HASH(0x7f92619e1b00)',
            type: 'object',
            variablesReference: 'HASH(0x7f92619e1b00)',
        }
    ]
}

*/
"use strict";
function getIndent(text) {
    return text.match(/^\s*/)[0].length;
}
const indent = 3; // Perl debugger variable indent
function variableType(value) {
    if (/^\'?(\-)?[0-9]+\'?$/.test(value))
        return 'integer';
    if (/^\'?(\-)?[0-9.,]+\'?$/.test(value))
        return 'float';
    if (/true|false/.test(value))
        return 'boolean';
    if (/^\'/.test(value))
        return 'string';
    if (/^ARRAY/.test(value))
        return 'array';
    if (/^HASH/.test(value))
        return 'object';
    return 'unknown';
}
exports.variableType = variableType;
function variableReference(value) {
    if (/^ARRAY|HASH/.test(value))
        return value;
    return '0';
}
function cleanString(value) {
    if (/^\'/.test(value) && /\'$/.test(value)) {
        return value.replace(/^\'/, '').replace(/\'$/, '');
    }
    return value;
}
function createVariable(key, val) {
    const name = cleanString(key);
    const value = cleanString(val);
    return {
        name,
        value,
        type: variableType(val),
        variablesReference: variableReference(value)
    };
}
function findVariableReference(variables, variablesReference) {
    const variableScopes = Object.keys(variables);
    let parentName = 0;
    let variable = null;
    for (let i = 0; i < variableScopes.length; i++) {
        const parentName = variableScopes[i];
        const scope = variables[parentName];
        for (let b = 0; b < scope.length; b++) {
            variable = scope[b];
            // Check if we found the needle
            if (variable.variablesReference === variablesReference) {
                return {
                    variable,
                    parentName,
                };
            }
        }
    }
    return null;
}
const topScope = /global_0|local_0|closure_0/;
function resolveVariable(name, variablesReference, variables) {
    // Resolve variables
    let limit = 0;
    let id = variablesReference;
    let key = name;
    const result = [];
    while (limit < 50 && !topScope.test(id)) {
        const parent = findVariableReference(variables, id);
        if (!parent) {
            throw new Error(`Cannot find variable "${id}"`);
        }
        if (parent.variable.type == 'array') {
            result.unshift(`[${key}]`);
        }
        else if (parent.variable.type == 'object') {
            result.unshift(`{${key}}`);
        }
        else {
            throw new Error('This dosnt look right');
        }
        id = parent.parentName;
        key = parent.variable.name;
        limit++;
    }
    result.unshift(key);
    return result.join('->');
}
exports.resolveVariable = resolveVariable;
/**
 * Fixes faulty variable data, an issue on windows
 *
 * Eg.: These lines are symptoms off an issue
 * '      1  '
 * '   \'list\' => '
 * '$obj = '
 */
function fixFaultyData(data) {
    const result = [];
    let merge = '';
    data.forEach(line => {
        if (/=>? $/.test(line) || /([0-9]+)  $/.test(line)) {
            merge = line;
        }
        else {
            result.push(merge + line);
            merge = '';
        }
    });
    return result;
}
function default_1(data, scopeName = '0') {
    const result = {};
    const context = [scopeName];
    let lastReference = scopeName;
    // console.log('-----> SCOPE', scopeName);
    fixFaultyData(data).forEach(line => {
        const contextIndent = context.length - 1;
        const lineIndent = getIndent(line) / indent;
        try {
            const [name, value] = line.match(/^([\s+]{0,})(\S+) =?>? ([\S\s]+)/).splice(2, 2);
            if (contextIndent > lineIndent) {
                context.splice(0, contextIndent - lineIndent);
            }
            else if (contextIndent < lineIndent) {
                context.unshift(lastReference);
            }
            // Check the indent poping / pushing context
            // console.log(lineIndent, line, `Context: "${context[0]}"`);
            // Ensure reference container
            if (typeof result[context[0]] === 'undefined') {
                result[context[0]] = [];
            }
            // Push variable to reference container
            result[context[0]].push(createVariable(name, value));
            // Post
            lastReference = value;
        }
        catch (err) {
        }
    });
    // console.log(result);
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdmFyaWFibGVQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXFCRTs7QUFFRixtQkFBbUIsSUFBWTtJQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDckMsQ0FBQztBQUVELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztBQUVsRCxzQkFBNkIsS0FBSztJQUNqQyxFQUFFLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3hELEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDeEQsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDL0MsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDdkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDekMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNsQixDQUFDO0FBUmUsb0JBQVksZUFRM0IsQ0FBQTtBQUVELDJCQUEyQixLQUFhO0lBQ3ZDLEVBQUUsQ0FBQyxDQUFD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