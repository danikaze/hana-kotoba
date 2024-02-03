export function emptyArray<T>(array: T[]): void {
  while (array.length) {
    array.pop();
  }
}
