import {
  JmDict,
  JmDictEntry,
  JmDictRePri,
  JmDictReadingElement,
  JmDictSenseElement,
  JmDictSensePos,
} from '@jmdict/types';

import { formatNumber } from './format';

interface UsableReading {
  reading: string;
  pri: JmDictRePri[];
}

/**
 * Analyze a `JmDict` object and find what readings are usable based on:
 * - the frequency of use (priority)
 * - length
 * - type of words (nouns and verbs)
 */
export function filterUsableReadings(xml: JmDict): UsableReading[] {
  console.log(' - Filtering usable readings...');
  const readings = new Map<string, Set<JmDictRePri>>();

  xml.entries
    .flatMap((entry) =>
      entry.readings.filter((reading) => isAcceptedReading(reading, entry))
    )
    .forEach((reading) => {
      const item = readings.get(reading.rEle);
      if (!item) {
        readings.set(reading.rEle, new Set(reading.pri!));
      } else {
        reading.pri?.forEach((pri) => item.add(pri));
      }
    });

  const res: UsableReading[] = [];
  for (const [reading, pri] of readings) {
    res.push({ reading, pri: Array.from(pri) });
  }

  console.log(
    `   - ${formatNumber(res.length)} / ${formatNumber(
      xml.entries.length
    )} usable`
  );
  return res;
}

function isAcceptedReading(
  reading: JmDictReadingElement,
  entry: JmDictEntry
): boolean {
  if (!isAcceptedLength(reading.rEle)) return false;
  if (!isAcceptedPri(reading.pri)) return false;

  return entry.senses.some((sense) => {
    if (!doesSenseApplies(reading.rEle, sense)) return false;
    if (!doesSenseApplies(reading.rEle, sense)) return false;
    if (!isAcceptedPos(sense.pos)) return false;
    return true;
  });
}

function isAcceptedPri(pri: undefined | JmDictRePri[]): boolean {
  return pri !== undefined;
}

function doesSenseApplies(reading: string, sense: JmDictSenseElement): boolean {
  return !sense.stagr || sense.stagr.includes(reading);
}

function isAcceptedLength(reading: string): boolean {
  return reading.length >= 2 && reading.length <= 5;
}

function isAcceptedPos(pos: undefined | JmDictSensePos[]): boolean {
  if (!pos) return false;
  return pos.includes('n') || pos.some((pos) => pos.startsWith('v'));
}
