/**
 * Calculate the union of two sets of chars
 * ABC + ACD = ABCD
 * AABC + ABBC = AABBC
 */
export function charsUnion(a: string, b: string): string {
  let res = a;
  const available = a.split('');

  for (const char of b) {
    const i = available.indexOf(char);
    if (i === -1) {
      res += char;
    } else {
      available.splice(i, 1);
    }
  }

  return res;
}
