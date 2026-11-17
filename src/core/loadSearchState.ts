import { HttpError } from './HttpError.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import type { SearchResultState } from '../types';
import { searchCountries } from './searchCountries.js';

function getErrorState(error: unknown): SearchResultState | null {
  if (error instanceof Error && error.name === 'AbortError') {
    return null;
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return {
      status: 'error',
      error: { kind: 'timeout', message: 'The request timed out. Please try again.' },
    };
  }

  if (error instanceof HttpError) {
    return {
      status: 'error',
      error: { kind: 'http', status: error.status, message: error.message },
    };
  }

  if (error instanceof TypeError) {
    return {
      status: 'error',
      error: {
        kind: 'network',
        message: 'Could not load countries. Check your connection and try again.',
      },
    };
  }

  return {
    status: 'error',
    error: { kind: 'unknown', message: 'An unexpected error occurred. Please try again.' },
  };
}

export async function loadSearchState(
  query: string,
  signal: AbortSignal,
): Promise<SearchResultState | null> {
  let rawCountries: unknown[];

  try {
    rawCountries = await searchCountries(query, signal);
  } catch (error: unknown) {
    return getErrorState(error);
  }

  if (rawCountries.length === 0) {
    return { status: 'empty', countries: [] };
  }

  return { status: 'success', countries: rawCountries.map(mapCountryResponse) };
}
