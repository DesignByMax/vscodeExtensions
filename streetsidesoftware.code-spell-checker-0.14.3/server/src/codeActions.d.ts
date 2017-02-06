import { TextDocuments, Command, CodeActionParams } from 'vscode-languageserver';
import { CSpellUserSettings } from './CSpellSettingsDef';
export declare function onCodeActionHandler(documents: TextDocuments, settings: CSpellUserSettings): (params: CodeActionParams) => Promise<Command[]>;
