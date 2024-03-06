import { WordPosition } from './find-matrix-words';

/**
 * Get the unique chars used by the given list of words
 */
export function getWordsUniqueChars(words: readonly WordPosition[]): string[] {
  return Array.from(new Set(words.flatMap((data) => data.word.split(''))));
}

/**
 * Get the minimum chars required to write the given list of words
 */
export function getWordsNeededChars(words: readonly WordPosition[]): string[] {
  const charCount: Record<string, number> = {};

  for (const entry of words) {
    const wordChars = entry.word.split('');
    const chars = Array.from(new Set(wordChars));
    for (const char of chars) {
      const n = wordChars.filter((c) => c === char).length;
      charCount[char] = Math.max(charCount[char] || 0, n);
    }
  }

  return Object.entries(charCount).reduce((res, [char, n]) => {
    for (let i = 0; i < n; i++) res.push(char);
    return res;
  }, [] as string[]);
}
