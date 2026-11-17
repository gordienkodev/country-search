import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadSearchState } from '../src/core/loadSearchState';

describe('loadSearchState', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should leave the current state unchanged on AbortError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Canceled', 'AbortError')));

    expect(await loadSearchState('Germany', new AbortController().signal)).toBeNull();
  });

  it('should expose a timeout as a distinct error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')),
    );

    expect(await loadSearchState('Germany', new AbortController().signal)).toEqual({
      status: 'error',
      error: { kind: 'timeout', message: 'The request timed out. Please try again.' },
    });
  });

  it('should expose an HTTP error with its status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    expect(await loadSearchState('Germany', new AbortController().signal)).toEqual({
      status: 'error',
      error: { kind: 'http', status: 503, message: 'HTTP error: 503' },
    });
  });

  it('should expose a network failure as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    expect(await loadSearchState('Germany', new AbortController().signal)).toEqual({
      status: 'error',
      error: {
        kind: 'network',
        message: 'Could not load countries. Check your connection and try again.',
      },
    });
  });

  it('should turn HTTP 404 into an empty state without parsing its body', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json }));

    expect(await loadSearchState('NoSuchCountry', new AbortController().signal)).toEqual({
      status: 'empty',
      countries: [],
    });
    expect(json).not.toHaveBeenCalled();
  });

  it('should turn an empty successful response into an empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    expect(await loadSearchState('NoSuchCountry', new AbortController().signal)).toEqual({
      status: 'empty',
      countries: [],
    });
  });

  it('should return mapped countries on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ name: 'Germany', capital: 'Berlin', population: 100 }],
      }),
    );

    expect(await loadSearchState('Germany', new AbortController().signal)).toEqual({
      status: 'success',
      countries: [
        {
          name: 'Germany',
          capital: 'Berlin',
          population: 100,
          flag: '',
          region: '',
          languages: [],
        },
      ],
    });
  });

  it('should handle an unexpected rejection without leaking its value to the UI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('unexpected value'));

    expect(await loadSearchState('Germany', new AbortController().signal)).toEqual({
      status: 'error',
      error: { kind: 'unknown', message: 'An unexpected error occurred. Please try again.' },
    });
  });
});
