import { JmDictRePri } from '@jmdict/types';

/**
 * Assign a numeric level to a reading.
 * The lower, the easier (more common words are easier)
 */
export function assignReadingLevel(
  reading: string,
  pri: JmDictRePri[]
): number {
  return Math.min(...pri.map(getLevel));
}

function getLevel(pri: JmDictRePri): number {
  const nfMatch = /nf(\d+)/.exec(pri);
  if (nfMatch) return Math.ceil(Number(nfMatch[1]) / 10);
  if (pri === 'ichi1') return 5;
  return 6;
}
