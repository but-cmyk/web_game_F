import viCatalog from './vi.json';
import enCatalog from './en.json';

export type Locale = 'vi' | 'en';

type Catalog = Record<string, string>;

const catalogs: Record<Locale, Catalog> = {
  vi: viCatalog,
  en: enCatalog,
};

let currentLocale: Locale = 'vi';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Translates a key with optional dynamic parameter interpolation.
 * Example: t('hud.depth', { depth: 3 }) => "Tầng 3"
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const activeCatalog = catalogs[currentLocale];
  const template = activeCatalog[key] ?? catalogs.vi[key] ?? key;

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    return params[token] !== undefined ? String(params[token]) : `{${token}}`;
  });
}

