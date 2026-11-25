// NoInfer: T comes from the english texts, so a key missing or added in german fails the type check
export function getTranslation<T>(translations: { de: NoInfer<T>; en: T }, language: string | undefined): T {
  const base = language?.split("-")[0].toLowerCase() ?? "";
  return Object.hasOwn(translations, base) ? (translations as Record<string, T>)[base] : translations.en;
}
