import { JmDict } from '@jmdict/types';
import { filterUsableReadings } from './filter-usable-entries';
import { formatNumber, formatPctg } from './format';
import { ReadingMetaData, getReadingMeta } from './get-reading-meta';

/**
 * Get all the usable readings from a JmDict object
 * and assign them with metadata
 */
export function getUsableReadingsMeta(
  xml: JmDict
): Readonly<Map<string, ReadingMetaData>> {
  // filter all usable entries
  const readings = filterUsableReadings(xml);

  // map the readings with extra metadata needed
  const { meta, levels } = readings.reduce(
    (res, { reading, pri }) => {
      const data = getReadingMeta(reading, pri);
      res.levels[data.level] = (res.levels[data.level] || 0) + 1;
      res.meta.set(reading, data);
      return res;
    },
    {
      meta: new Map<string, ReadingMetaData>(),
      levels: {} as Record<number, number>,
    }
  );

  console.log(
    `Available words by level:\n${Object.entries(levels)
      .map(
        ([level, nWords]) =>
          `  - Level ${level}: ${formatNumber(nWords)} (${formatPctg(
            nWords / readings.length
          )})`
      )
      .join('\n')}`
  );

  return meta;
}
