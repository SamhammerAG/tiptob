export const FALLBACK_LANGUAGE = "en";

export function getTranslation<T>(translations: Record<string, T>, language: string | undefined): T {
  return translations[language ?? FALLBACK_LANGUAGE] ?? translations[FALLBACK_LANGUAGE];
}
