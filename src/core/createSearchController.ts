import type { SearchResultState } from './loadSearchState.js';

export type SearchState = { status: 'loading' } | SearchResultState;

export interface SearchController {
  setQuery(query: string): void;
}

export function createSearchController(
  onStateChange: (state: SearchState) => void,
  delay: number = 300,
): SearchController {
  void onStateChange;
  void delay;
  throw new Error('Not implemented');
}
