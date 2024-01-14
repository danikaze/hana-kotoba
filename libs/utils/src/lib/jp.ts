const FIRST_HIRAGANA = 0x3040;
const LAST_HIRAGANA = 0x309f;
const FIRST_KATAKANA = 0x30a0;
const LAST_KATAKANA = 0x30ff;
const FIRST_KANJI = 0x4e00;
const LAST_KANJI = 0x9faf;

/**
 * Checks if the given **single character** is hiragana
 */
export function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= FIRST_HIRAGANA && code <= LAST_HIRAGANA;
}

/**
 * Checks if the given **single character** is katakana
 */
export function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= FIRST_KATAKANA && code <= LAST_KATAKANA;
}

/**
 * Checks if the given **single character** is a kanji
 */
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= FIRST_KANJI && code <= LAST_KANJI;
}

/**
 * Checks if the given word is completely hiragana
 */
export function isFullHiragana(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    if (code < FIRST_HIRAGANA || code > LAST_HIRAGANA) return false;
  }
  return true;
}

/**
 * Checks if the given word is completely katakana
 */
export function isFullKatakana(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    if (code < FIRST_KATAKANA || code > LAST_KATAKANA) return false;
  }
  return true;
}

/**
 * Checks if the given word is completely a kanji
 */
export function isFullKanji(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    if (code < FIRST_KANJI || code > LAST_KANJI) return false;
  }
  return true;
}
