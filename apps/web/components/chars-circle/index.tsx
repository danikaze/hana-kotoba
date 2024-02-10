import { FC } from 'react';
import { clsx } from 'clsx';

import { CharSelectedResult } from '../hana-game/hooks';
import { useCharsCircle } from './hooks';
import { Char } from './char';
import { Connections } from './connections';

import styles from './chars-circle.module.scss';

export interface Props {
  chars: string[];
  /**
   * Every time a character is selected send the composed word to this
   * callback, which will return if it was a valid word or not
   */
  onCharSelected: (word: string) => CharSelectedResult;
}

export const CharsCircle: FC<Props> = (props) => {
  const { charData, vertices, wordFound } = useCharsCircle(props);

  return (
    <div className={clsx(styles.root, styles[`chars${charData.length}`])}>
      <Connections vertices={vertices} isWord={wordFound} />
      {charData.map(({ index }) => (
        <Char key={index} {...charData[index]} />
      ))}
    </div>
  );
};
