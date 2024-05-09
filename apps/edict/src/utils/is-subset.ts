/**
 * Check if the `part` is a subset of `all`
 *
 * @param part subset to check
 * @param all list of every character (superset)
 *
 * Neither `part` nor `all` need to be sorted
 *
 * i.e. `ABC` is a subset of `ABCDE`
 *      `BC` and `CB` are a subset of `ABCDE` and `AEBCD`, etc.
 *      `AA`  is NOT a subset of `ABCDE`
 */
export function isSubSet(part: string, all: string): boolean {
  const available = all.split('');

  for (const char of part) {
    const index = available.indexOf(char);
    if (index === -1) return false;
    available.splice(index, 1);
  }

  return true;
}
