/**
 * Check if the `part` is a subset of `all`
 * Note that for performance, `part` and `all` both are supposed ordered already
 *
 * i.e. `ABC` is a subset of `ABCDE`
 *      `BC`  is a subset of `ABCDE`
 *      `AA`  is NOT a subset of `ABCDE`
 */
export function isSubSet(part: string, all: string): boolean {
  let index = -1;

  for (const char of part) {
    index = all.indexOf(char, index + 1);
    if (index === -1) return false;
  }

  return true;
}
