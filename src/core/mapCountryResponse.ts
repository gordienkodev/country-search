export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}

export function mapCountryResponse(raw: unknown): Country {
  void raw;

  throw new Error('Not implemented');
}
