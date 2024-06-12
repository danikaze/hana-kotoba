import { useMemo } from 'react';
import { Props } from '.';

export function useJishoPanelWord(props: Props) {
  const { firstReading, otherReadings, firstKanji, otherKanjis } =
    useMemo(() => {
      const [firstReading, ...otherReadings] = props.readings;
      const [firstKanji, ...otherKanjis] = props.kanjis;
      return {
        firstReading,
        otherReadings,
        firstKanji,
        otherKanjis,
      };
    }, [props]);

  return {
    firstReading,
    otherReadings,
    firstKanji,
    otherKanjis,
    senses: props.senses,
  };
}
