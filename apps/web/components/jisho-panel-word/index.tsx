import { clsx } from 'clsx';
import { FC } from 'react';

import { JishoWord, JishoWordSense } from '@jmdict/model';
import { JM_DICT_SENSE_POS, JmDictSensePos } from '@jmdict/types';

import { useJishoPanelWord } from './hooks';

import styles from './jisho-panel-word.module.scss';

export type Props = JishoWord;

export const JishoPanelWord: FC<Props> = (props) => {
  const { firstReading, otherReadings, firstKanji, otherKanjis, senses } =
    useJishoPanelWord(props);

  return (
    <div className={styles.root}>
      <KanjiBlock reading={firstReading} kanji={firstKanji} />
      <ol className={styles.senses}>
        {senses.map((sense, i) => (
          <Sense {...sense} key={i} />
        ))}
      </ol>
      <OtherForms readings={otherReadings} kanjis={otherKanjis} />
    </div>
  );
};

const Sense: FC<JishoWordSense> = ({ meanings, pos }) => {
  return (
    <li className={styles.sense}>
      {pos.map((pos, i) => (
        <Pos key={i} pos={pos} />
      ))}{' '}
      <span>{meanings.join(', ')}</span>
    </li>
  );
};

const Pos: FC<{ pos: JmDictSensePos }> = ({ pos }) => {
  const title = JM_DICT_SENSE_POS[pos];
  return (
    <span className={styles.pos} title={title}>
      {pos}
    </span>
  );
};

const KanjiBlock: FC<{ reading: string; kanji?: string }> = ({
  reading,
  kanji,
}) => {
  if (!kanji) {
    return <div className={clsx(styles.mainKanji, styles.empty)} />;
  }

  return (
    <div className={styles.mainKanji}>
      <ruby>
        {kanji}
        <rp>(</rp>
        <rt>{reading}</rt>
        <rp>)</rp>
      </ruby>
    </div>
  );
};

const OtherForms: FC<{ readings: string[]; kanjis: string[] }> = ({
  readings,
  kanjis,
}) => {
  if (!readings.length && !kanjis.length) return null;
  return <div className={styles.otherForms} />;
};
