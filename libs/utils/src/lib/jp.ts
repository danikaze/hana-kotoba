/**
 * Checks if the given **single character** is hiragana
 */
export function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

/**
 * Checks if the given **single character** is katakana
 */
export function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

/**
 * Checks if the given **single character** is a kanji
 */
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9faf;
}
