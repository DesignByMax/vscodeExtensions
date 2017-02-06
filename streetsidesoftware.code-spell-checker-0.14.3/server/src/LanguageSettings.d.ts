import { LanguageSetting, CSpellUserSettings } from './CSpellSettingsDef';
export declare type LanguageSettings = LanguageSetting[];
export declare const defaultLanguageSettings: LanguageSettings;
export declare function getDefaultLanguageSettings(): CSpellUserSettings;
export declare function calcSettingsForLanguage(languageSettings: LanguageSettings, languageId: string): LanguageSetting;
export declare function calcUserSettingsForLanguage(settings: CSpellUserSettings, languageId: string): CSpellUserSettings;
