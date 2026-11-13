export function debounce(
  fn: (...args: unknown[]) => void,
  delay: number,
): (...args: unknown[]) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: unknown[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
