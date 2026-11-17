export interface DebouncedFunction {
  (...args: unknown[]): void;
  cancel(): void;
}

export function debounce(fn: (...args: unknown[]) => void, delay: number): DebouncedFunction {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: unknown[]): void => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}
