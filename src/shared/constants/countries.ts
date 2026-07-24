export type CountryCode = 'VN' | 'TH' | 'MY' | 'ID' | 'KH' | 'SG' | 'PH' | 'MM' | 'LA' | 'TL';

export interface CountryDefinition {
  code: CountryCode;
  name: string;
  aliases: string[];
}

const COUNTRY_DEFINITIONS: CountryDefinition[] = [
  { code: 'VN', name: 'Vietnam', aliases: ['VN', 'VIE'] },
  { code: 'TH', name: 'Thailand', aliases: ['TH', 'THA'] },
  { code: 'MY', name: 'Malaysia', aliases: ['MY', 'MAS', 'MYS'] },
  { code: 'ID', name: 'Indonesia', aliases: ['ID', 'IDN'] },
  { code: 'KH', name: 'Cambodia', aliases: ['KH', 'CAM', 'KHM'] },
  { code: 'SG', name: 'Singapore', aliases: ['SG', 'SIN', 'SGP'] },
  { code: 'PH', name: 'Philippines', aliases: ['PH', 'PHI', 'PHL'] },
  { code: 'MM', name: 'Myanmar', aliases: ['MM', 'MYA', 'MMR'] },
  { code: 'LA', name: 'Laos', aliases: ['LA', 'LAO'] },
  { code: 'TL', name: 'Timor-Leste', aliases: ['TL', 'TLS'] },
];

const aliasLookup = new Map<string, CountryCode>();
const countryLookup = new Map<CountryCode, CountryDefinition>();

COUNTRY_DEFINITIONS.forEach((definition) => {
  countryLookup.set(definition.code, definition);
  definition.aliases.forEach((alias) => {
    aliasLookup.set(alias.toUpperCase(), definition.code);
  });
});

export function normalizeCountryCode(input: string | null | undefined): CountryCode | null {
  if (!input) {
    return null;
  }

  const normalized = input.trim().toUpperCase();
  return aliasLookup.get(normalized) ?? null;
}

export function getCountryByCode(code: string | null | undefined): CountryDefinition | null {
  const normalized = normalizeCountryCode(code);
  if (!normalized) {
    return null;
  }

  return countryLookup.get(normalized) ?? null;
}

export function getCountryName(code: string | null | undefined): string {
  return getCountryByCode(code)?.name ?? 'Unknown Country';
}

export function getSupportedCountryCodes(): CountryCode[] {
  return COUNTRY_DEFINITIONS.map((country) => country.code);
}
