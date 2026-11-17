import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchCountries } from '../src/core/searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return countries on successful response', async () => {
    const countries = [{ name: 'Germany' }, { name: 'France' }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => countries,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('Ger', controller.signal);

    expect(result).toEqual(countries);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should propagate abort error', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');

    const fetchMock = vi.fn().mockRejectedValue(abortError);

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('Ger', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('should pass signal to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('Ger', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it('should throw on network error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('Ger', controller.signal)).rejects.toThrow('Failed to fetch');
  });

  it('should throw on HTTP error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('Lol', controller.signal)).rejects.toThrow('HTTP error: 500');
  });
});
