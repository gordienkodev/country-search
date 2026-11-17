import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../src/core/createSearchController';
import { loadSearchState } from '../src/core/loadSearchState';
import type { SearchResultState } from '../src/core/loadSearchState';

vi.mock('../src/core/loadSearchState', () => ({
  loadSearchState: vi.fn(),
}));

const loadSearchStateMock = vi.mocked(loadSearchState);

describe('createSearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    loadSearchStateMock.mockReset();
    loadSearchStateMock.mockResolvedValue({ status: 'empty', countries: [] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should not start a request before the debounce delay has elapsed', async () => {
    const controller = createSearchController(vi.fn(), 300);

    controller.setQuery('Germany');
    await vi.advanceTimersByTimeAsync(299);

    expect(loadSearchStateMock).not.toHaveBeenCalled();
  });

  it('should make one request with the latest query after rapid input', async () => {
    const controller = createSearchController(vi.fn(), 300);

    controller.setQuery('G');
    await vi.advanceTimersByTimeAsync(100);
    controller.setQuery('Ger');
    await vi.advanceTimersByTimeAsync(100);
    controller.setQuery('Germany');
    await vi.advanceTimersByTimeAsync(299);

    expect(loadSearchStateMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(loadSearchStateMock).toHaveBeenCalledExactlyOnceWith('Germany', expect.any(AbortSignal));
  });

  it('should publish loading when the request starts', async () => {
    loadSearchStateMock.mockReturnValue(new Promise(() => {}));
    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange, 300);

    controller.setQuery('Germany');
    expect(onStateChange).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(loadSearchStateMock).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledExactlyOnceWith({ status: 'loading' });
  });

  it('should publish the result state after the request resolves', async () => {
    const result: SearchResultState = {
      status: 'success',
      countries: [
        {
          name: 'Germany',
          flag: '',
          capital: 'Berlin',
          region: 'Europe',
          population: 100,
          languages: ['German'],
        },
      ],
    };
    let resolveRequest!: (state: SearchResultState | null) => void;
    loadSearchStateMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange, 300);

    controller.setQuery('Germany');
    await vi.advanceTimersByTimeAsync(300);
    expect(onStateChange.mock.calls).toEqual([[{ status: 'loading' }]]);

    resolveRequest(result);
    await vi.advanceTimersByTimeAsync(0);

    expect(onStateChange.mock.calls).toEqual([[{ status: 'loading' }], [result]]);
  });

  it('should not publish a null result returned after cancellation', async () => {
    loadSearchStateMock.mockResolvedValue(null);
    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange, 300);

    controller.setQuery('Germany');
    await vi.advanceTimersByTimeAsync(300);

    expect(loadSearchStateMock).toHaveBeenCalledTimes(1);
    expect(onStateChange.mock.calls).toEqual([[{ status: 'loading' }]]);
  });

  it('should abort the active request immediately when input changes before the next debounce', async () => {
    loadSearchStateMock.mockImplementationOnce(
      (_query, signal) =>
        new Promise((resolve) => {
          signal.addEventListener('abort', () => resolve(null), { once: true });
        }),
    );
    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange, 300);

    controller.setQuery('Germany');
    await vi.advanceTimersByTimeAsync(300);

    expect(loadSearchStateMock).toHaveBeenCalledTimes(1);
    const activeSignal = loadSearchStateMock.mock.calls[0]![1];
    expect(activeSignal.aborted).toBe(false);

    controller.setQuery('France');

    expect(activeSignal.aborted).toBe(true);
    expect(activeSignal.reason.name).toBe('AbortError');
    expect(loadSearchStateMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(299);

    expect(loadSearchStateMock).toHaveBeenCalledTimes(1);
    expect(onStateChange.mock.calls).toEqual([[{ status: 'loading' }]]);

    await vi.advanceTimersByTimeAsync(1);

    expect(loadSearchStateMock).toHaveBeenCalledTimes(2);
    expect(loadSearchStateMock).toHaveBeenLastCalledWith('France', expect.any(AbortSignal));
    const nextSignal = loadSearchStateMock.mock.calls[1]![1];
    expect(nextSignal).not.toBe(activeSignal);
    expect(nextSignal.aborted).toBe(false);
  });
});
