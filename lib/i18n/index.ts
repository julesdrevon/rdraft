import { ar } from "./ar";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt } from "./pt";
import { ru } from "./ru";
import { tr } from "./tr";

/** French is the reference dictionary: every other locale must match its shape. */
export type Translation = typeof fr;

export interface LocaleConfig {
  label: string;
  /** Country code for `flag-icons`, which is not always the language code. */
  flag: string;
  /** Locale accepted by Data Dragon for champion names. */
  data: string;
  /** Locale accepted by Community Dragon for voice lines. */
  voice: string;
  /** Right-to-left scripts need the document direction flipped. */
  rtl?: boolean;
  dict: Translation;
}

export const LOCALES = {
  fr: { label: "Français", flag: "fr", data: "fr_FR", voice: "fr_fr", dict: fr },
  en: { label: "English", flag: "gb", data: "en_US", voice: "default", dict: en },
  es: { label: "Español", flag: "es", data: "es_ES", voice: "es_es", dict: es },
  de: { label: "Deutsch", flag: "de", data: "de_DE", voice: "de_de", dict: de },
  it: { label: "Italiano", flag: "it", data: "it_IT", voice: "it_it", dict: it },
  pt: { label: "Português", flag: "br", data: "pt_BR", voice: "pt_br", dict: pt },
  ru: { label: "Русский", flag: "ru", data: "ru_RU", voice: "ru_ru", dict: ru },
  tr: { label: "Türkçe", flag: "tr", data: "tr_TR", voice: "tr_tr", dict: tr },
  ja: { label: "日本語", flag: "jp", data: "ja_JP", voice: "ja_jp", dict: ja },
  ko: { label: "한국어", flag: "kr", data: "ko_KR", voice: "ko_kr", dict: ko },
  // Data Dragon has no Arabic champion data, so names fall back to English.
  ar: { label: "العربية", flag: "sa", data: "en_US", voice: "ar_ae", rtl: true, dict: ar },
} satisfies Record<string, LocaleConfig>;

export type LangCode = keyof typeof LOCALES;

export const LANG_CODES = Object.keys(LOCALES) as LangCode[];

export const DEFAULT_LANG: LangCode = "fr";
