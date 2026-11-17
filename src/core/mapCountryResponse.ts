import type { Country, CountryLanguageResponse, CountryCurrencyResponse } from '../types';

export function mapCountryResponse(raw: unknown): Country {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new TypeError('Invalid country response');
  }

  const data = raw as Record<string, unknown>;

  const flags = data.flags as Record<string, unknown> | undefined;

  const languages = Array.isArray(data.languages)
    ? data.languages
        .filter(
          (language): language is CountryLanguageResponse =>
            typeof language === 'object' && language !== null && typeof language.name === 'string',
        )
        .map((language) => language.name)
    : [];

  const country: Country = {
    name: typeof data.name === 'string' ? data.name : '',
    flag: typeof flags?.png === 'string' ? flags.png : '',
    capital: typeof data.capital === 'string' ? data.capital : '',
    region: typeof data.region === 'string' ? data.region : '',
    population: typeof data.population === 'number' ? data.population : 0,
    languages,
  };

  if (typeof data.area === 'number') {
    country.area = data.area;
  }

  if (Array.isArray(data.borders)) {
    country.borders = data.borders.filter((border): border is string => typeof border === 'string');
  }

  if (Array.isArray(data.currencies)) {
    country.currencies = data.currencies
      .filter(
        (currency): currency is CountryCurrencyResponse =>
          typeof currency === 'object' && currency !== null && typeof currency.name === 'string',
      )
      .map((currency) => {
        const code = typeof currency.code === 'string' ? ` (${currency.code})` : '';
        const symbol = typeof currency.symbol === 'string' ? ` ${currency.symbol}` : '';
        return `${currency.name}${code}${symbol}`;
      });
  }

  return country;
}
