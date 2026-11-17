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
  let activeController: AbortController | undefined;

  const debouncedSearch = debounce(async () => {
    const query = latestQuery;
    const controller = new AbortController();
    activeController = controller;

    onStateChange({ status: 'loading' });

    const state = await loadSearchState(query, controller.signal);

    if (activeController === controller) {
      activeController = undefined;
    }

    if (state !== null && !controller.signal.aborted) {
      onStateChange(state);
    }
  }, delay);

  return {
    setQuery(query: string): void {
      activeController?.abort();
      activeController = undefined;
      latestQuery = query;

      if (query.trim() === '') {
        debouncedSearch.cancel();
        onStateChange({ status: 'empty', countries: [] });
        return;
      }

      debouncedSearch();
    },
  };
}
