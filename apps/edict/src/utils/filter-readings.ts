import { ReadingMetaData } from './get-reading-meta';

/**
 * Filter the readings based on their level
 */
export function filterReadings(
  meta: Readonly<Map<string, ReadingMetaData>>,
  minLevel: number,
  maxLevel = minLevel
): Readonly<Map<string, ReadingMetaData>> {
  // filter by level
  return Array.from(meta.entries()).reduce((res, [reading, wordMeta]) => {
    if (wordMeta.level >= minLevel && wordMeta.level <= maxLevel) {
      res.set(reading, wordMeta);
    }
    return res;
  }, new Map<string, ReadingMetaData>());
}
