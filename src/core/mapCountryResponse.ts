export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}

export function mapCountryResponse(raw: unknown): Country {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new TypeError('Invalid country response');
  }

  const data = raw as Record<string, unknown>;

  const flags = data.flags as Record<string, unknown> | undefined;

  const languages = Array.isArray(data.languages)
    ? data.languages
        .filter(
          (language): language is { name: string } =>
            typeof language === 'object' && language !== null && typeof language.name === 'string',
        )
        .map((language) => language.name)
    : [];

  return {
    name: typeof data.name === 'string' ? data.name : '',
    flag: typeof flags?.png === 'string' ? flags.png : '',
    capital: typeof data.capital === 'string' ? data.capital : '',
    region: typeof data.region === 'string' ? data.region : '',
    population: typeof data.population === 'number' ? data.population : 0,
    languages,
  };
}
