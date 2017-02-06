import * as Rx from 'rx';
export interface WordDictionary {
    [index: string]: boolean;
}
export declare type WordSet = Set<string>;
export declare function loadWordsRx(filename: string): Rx.Observable<string>;
export declare function splitLine(line: string): string[];
export declare function splitCodeWords(words: string[]): string[];
export declare function splitLineIntoCodeWordsRx(line: string): Rx.Observable<string>;
export declare function splitLineIntoWordsRx(line: string): Rx.Observable<string>;
/**
 * @deprecated
 */
export declare function processWordListLinesRx(lines: Rx.Observable<string>, minWordLength: number): Rx.Observable<{
    setOfWords: Set<string>;
    found: boolean;
    word: string;
}>;
/**
 * @deprecated
 */
export declare function processWordsRx(lines: Rx.Observable<string>): Rx.Observable<{
    setOfWords: Set<string>;
    found: boolean;
    word: string;
}>;
/**
 * @deprecated
 */
export declare function processCodeWordsRx(entries: Rx.Observable<string>, minWordLength: number): Rx.Observable<string>;
export declare function rxSplitIntoWords(lines: Rx.Observable<string>): Rx.Observable<string>;
export declare function rxSplitCamelCaseWords(words: Rx.Observable<string>): Rx.Observable<string>;
export declare function processWordsOld(lines: Rx.Observable<string>): Rx.Observable<{
    setOfWords: WordDictionary;
    found: boolean;
    word: string;
}>;
