'use strict';
const vscode = require('vscode');
const initialConfigurations = {
    version: '0.0.2',
    configurations: [
        {
            type: 'perl',
            request: 'launch',
            exec: 'perl',
            name: 'Perl-Debug',
            root: '${workspaceRoot}/',
            program: '${workspaceRoot}/${command.AskForProgramName}',
            inc: [],
            stopOnEntry: true
        }
    ] };
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.perl-debug.getProgramName', config => {
        return vscode.window.showInputBox({
            placeHolder: "Please enter the name of a perl file in the workspace folder",
            value: "test.pl"
        });
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(vscode.commands.registerCommand('extension.perl-debug.provideInitialConfigurations', () => {
        return [
            JSON.stringify(initialConfigurations, null, '\t')
        ].join('\n');
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V4dGVuc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixNQUFZLE1BQU0sV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUVqQyxNQUFNLHFCQUFxQixHQUFHO0lBQzdCLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLGNBQWMsRUFBRTtRQUNoQjtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLFFBQVE7WUFDakIsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsWUFBWTtZQUNsQixJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLE9BQU8sRUFBRSwrQ0FBK0M7WUFDeEQsR0FBRyxFQUFFLEVBQUU7WUFDUCxXQUFXLEVBQUUsSUFBSTtTQUNqQjtLQUNELEVBQUMsQ0FBQTtBQUVGLGtCQUF5QixPQUFnQztJQUV4RCxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxxQ0FBcUMsRUFBRSxNQUFNO1FBQzdGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUNqQyxXQUFXLEVBQUUsOERBQThEO1lBQzNFLEtBQUssRUFBRSxTQUFTO1NBQ2hCLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFdkMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsbURBQW1ELEVBQUU7UUFDL0csTUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1NBQ2pELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFmZSxnQkFBUSxXQWV2QixDQUFBO0FBRUQ7QUFDQSxDQUFDO0FBRGUsa0JBQVUsYUFDekIsQ0FBQSJ9