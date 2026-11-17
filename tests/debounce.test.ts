import { describe, it, expect, vi, afterEach } from 'vitest';

import { debounce } from '../src/core/debounce';

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call function after delay', () => {
    vi.useFakeTimers();

    const fn = vi.fn();

    const debounced = debounce(fn, 300);

    debounced();

    vi.advanceTimersByTime(299);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on repeated call', () => {
    vi.useFakeTimers();

    const fn = vi.fn();

    const debounced = debounce(fn, 300);

    debounced();

    vi.advanceTimersByTime(200);

    debounced();

    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call function only once after multiple calls', () => {
    vi.useFakeTimers();

    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();

    vi.advanceTimersByTime(100);

    debounced();

    vi.advanceTimersByTime(100);

    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
