import { TextDocument, Diagnostic } from 'vscode-languageserver';
import * as Text from './util/text';
import * as Rx from 'rx';
export declare const diagSource = "cSpell Checker";
import { CSpellUserSettings } from './CSpellSettingsDef';
export declare function validateTextDocument(textDocument: TextDocument, options: CSpellUserSettings): Rx.Promise<Diagnostic[]>;
export declare function validateText(text: string, languageId: string, options: CSpellUserSettings): Promise<Text.WordOffset[]>;
export declare function validateTextDocumentAsync(textDocument: TextDocument, options: CSpellUserSettings): Rx.Observable<Diagnostic>;
