export interface Country {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  area?: number;
  borders?: string[];
  currencies?: string[];
}

export interface CountryLanguageResponse {
  name: string;
}

export interface CountryCurrencyResponse {
  name: string;
  code?: string;
  symbol?: string;
}

export type SearchError =
  | { kind: 'timeout' | 'network' | 'unknown'; message: string }
  | { kind: 'http'; status: number; message: string };

export type SearchResultState =
  | { status: 'empty'; countries: [] }
  | { status: 'success'; countries: Country[] }
  | { status: 'error'; error: SearchError };

export type SearchState = { status: 'loading' } | SearchResultState;

export interface SearchController {
  setQuery(query: string): void;
  retry(): Promise<void>;
}

export interface DebouncedFunction {
  (...args: unknown[]): void;
  cancel(): void;
}
