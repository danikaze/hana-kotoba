import { FC, useMemo } from 'react';
import { JishoWord } from '@jmdict/model';

import { JishoPanelWordGroup } from '../jisho-panel-word-group';

import styles from './jisho-panel.module.scss';

export interface JishoWordGroup {
  kana: string;
  words: JishoWord[];
}

export interface Props {
  total: number;
  words: JishoWordGroup[];
  openWords: number[];
  toggleWord: (index: number) => void;
}

export const Jisho: FC<Props> = ({ openWords, toggleWord, words, total }) => {
  const toggleFns = useMemo(() => {
    const fns: (() => void)[] = [];
    for (let i = 0; i < total; i++) {
      fns[i] = () => toggleWord(i);
    }
    return fns;
  }, [toggleWord, total]);

  const content = words.length ? (
    words.map((group, i) => (
      <JishoPanelWordGroup
        group={group}
        key={i}
        toggle={toggleFns[i]}
        isOpen={openWords.includes(i)}
      />
    ))
  ) : (
    <EmptyPanel />
  );

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>
        Found words ({words.length}/{total})
      </h2>
      {content}
    </div>
  );
};

const EmptyPanel: FC = () => {
  return (
    <div className={styles.emptyPanel}>
      Found words and their details will appear here when discovered.
    </div>
  );
};
