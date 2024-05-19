import { ReadingMetaData } from './get-reading-meta';

/**
 * Given the list of words and the pre-processed metadata object,
 * calculate the level of a game with the given words
 * In this case is the average but each level weights exponentially
 */
export function getCombinedLevel(
  meta: Map<string, ReadingMetaData>,
  words: Readonly<string[]>
): number {
  const levels = words.map((word) => meta.get(word)!.level);
  return (
    levels.reduce((total, level) => total + level * level, 0) / levels.length
  );
}
