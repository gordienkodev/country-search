import { debounce } from './debounce.js';
import { loadSearchState } from './loadSearchState.js';
import type { SearchResultState } from './loadSearchState.js';

export type SearchState = { status: 'loading' } | SearchResultState;

export interface SearchController {
  setQuery(query: string): void;
}

export function createSearchController(
  onStateChange: (state: SearchState) => void,
  delay: number = 300,
): SearchController {
  let latestQuery = '';

  const debouncedSearch = debounce(async () => {
    const query = latestQuery;
    const controller = new AbortController();

    onStateChange({ status: 'loading' });

    const state = await loadSearchState(query, controller.signal);

    if (state !== null) {
      onStateChange(state);
    }
  }, delay);

  return {
    setQuery(query: string): void {
      latestQuery = query;
      debouncedSearch();
    },
  };
}
