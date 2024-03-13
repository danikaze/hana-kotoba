import { JmDictRePri } from '@jmdict/types';
import { assignReadingLevel } from './assign-level';

export type ReadingMetaData = {
  reading: string;
  pri: JmDictRePri[];
  chars: string[];
  level: number;
  gai: boolean;
};

export function getReadingMeta(
  reading: string,
  pri: JmDictRePri[]
): ReadingMetaData {
  return {
    reading,
    pri,
    chars: [...reading].sort(),
    level: assignReadingLevel(reading, pri),
    gai: pri.some((pri) => pri.startsWith('gai')),
  };
}
