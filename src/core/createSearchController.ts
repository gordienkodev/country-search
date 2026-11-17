import { debounce } from './debounce.js';
import { loadSearchState } from './loadSearchState.js';
import type { SearchController, SearchState } from '../types';

export function createSearchController(
  onStateChange: (state: SearchState) => void,
  delay: number = 300,
): SearchController {
  let latestQuery = '';
  let activeController: AbortController | undefined;

  const runSearch = async (): Promise<void> => {
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
  };

  const debouncedSearch = debounce(runSearch, delay);

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
    async retry(): Promise<void> {
      debouncedSearch.cancel();
      activeController?.abort();
      activeController = undefined;

      if (latestQuery.trim() === '') {
        return;
      }

      await runSearch();
    },
  };
}
