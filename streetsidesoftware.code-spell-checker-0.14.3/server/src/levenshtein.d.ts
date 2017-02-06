export interface LevenshteinResultMatrix {
    matrix: number[][];
    wordTop: string;
    wordSide: string;
}
export declare function calcLevenshteinMatrix(a: string, b: string): LevenshteinResultMatrix;
export declare function calcLevenshteinMatrixAsText(a: string, b: string): string;
export declare function levenshteinMatrixAsText(matrixResult: LevenshteinResultMatrix): string;
