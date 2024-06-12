import clsx from 'clsx';
import { FC } from 'react';

import { JishoWord } from '@jmdict/model';

import { JishoPanelWord } from '../jisho-panel-word';

import styles from './jisho-panel-word-group.module.scss';

export interface JishoWordGroup {
  kana: string;
  words: JishoWord[];
}

export interface Props {
  group: JishoWordGroup;
  isOpen: boolean;
  toggle: () => void;
}

export const JishoPanelWordGroup: FC<Props> = ({ isOpen, group, toggle }) => {
  return (
    <div className={clsx(styles.root, !isOpen && styles.closed)}>
      <div className={styles.kana} onClick={toggle}>
        {group.kana}
      </div>
      <div className={styles.entriesContainer}>
        <div className={styles.entries}>
          {group.words.map((word, i) => (
            <JishoPanelWord {...word} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
