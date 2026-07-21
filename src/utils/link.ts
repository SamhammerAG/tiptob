const allowedProtocols = new Set(["http:", "https:"]);

export function normalizeLinkHref(value: string): string | null {
  const href = value.trim();
  if (!href) return null;

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(href) ? href : `https://${href}`;

  try {
    const url = new URL(candidate);
    return allowedProtocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
