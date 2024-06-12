'use client';

import { clsx } from 'clsx';
import { FC } from 'react';

import { CharsCircle } from '../chars-circle';
import { CompletedModal } from '../completed-modal';
import { JishoPanel } from '../jisho-panel';
import { WordMatrix } from '../word-matrix';
import { useHanaPage } from './hooks';

import styles from './hana-game.module.scss';

export interface FoundCell {
  col: number;
  row: number;
}

export const HanaGame: FC = () => {
  const {
    layout,
    totalWords,
    completed,
    loadTry,
    matrix,
    chars,
    foundWords,
    openJishoWords,
    isFoundCell,
    onCharSelected,
    getNewBoard,
    toggleJishoWord,
  } = useHanaPage();

  if (!matrix) {
    return (
      <div className={clsx(styles.root, styles.loading)}>
        Loading... ({loadTry})
      </div>
    );
  }

  return (
    <div className={clsx(styles.root, styles[layout])}>
      <div className={clsx(styles.quarter, styles.matrix)}>
        <div className={styles.container}>
          <WordMatrix rows={matrix} isFoundCell={isFoundCell} />
        </div>
      </div>
      <div className={clsx(styles.quarter, styles.circle)}>
        <div className={styles.container}>
          <CharsCircle chars={chars!} onCharSelected={onCharSelected} />
        </div>
        {completed && <CompletedModal reloadBoard={getNewBoard} />}
      </div>
      <div className={clsx(styles.jisho)}>
        <JishoPanel
          words={foundWords}
          total={totalWords}
          openWords={openJishoWords}
          toggleWord={toggleJishoWord}
        />
      </div>
    </div>
  );
};
