export function debounce(
  fn: (...args: unknown[]) => void,
  delay: number,
): (...args: unknown[]) => void {
  void delay;
  return (...args: unknown[]) => {
    fn(...args);
  };
}
