export function elemToArray<T>(elem: T | T[]): T[] {
  return Array.isArray(elem) ? elem : [elem];
}
