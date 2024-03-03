/**
 * Check if all available chars are used to write the words
 * ああああい => ["あい"] // false, only 1 あ and the い are used
 * ああいうえ => ["ああ", "あい", "あう", "うえ"] // true, (not all at the same word)
 */
export function areAllCharsUsed(chars: string, words: string[]): boolean {
  const charsArray = chars.split('');
  const used = charsArray.map(() => false);

  for (const word of words) {
    const thisWordUsed = charsArray.map(() => false);

    for (const char of word) {
      const i = thisWordUsed.findIndex((used, i) => !used && chars[i] === char);
      if (i === -1) continue;
      thisWordUsed[i] = true;
    }

    for (let i = 0; i < used.length; i++) {
      used[i] = used[i] || thisWordUsed[i];
    }

    if (used.every(Boolean)) return true;
  }

  return false;
}
