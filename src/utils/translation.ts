export function getTranslation<T>(translations: { de: T; en: T }, language: string | undefined): T {
  return (translations as Record<string, T>)[language ?? "en"] ?? translations.en;
}
