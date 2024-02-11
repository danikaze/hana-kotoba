'use client';

import { FC } from 'react';
import { clsx } from 'clsx';

import { WordMatrix } from '../word-matrix';
import { CharsCircle } from '../chars-circle';
import { CompletedModal } from '../completed-modal';
import { useHanaPage } from './hooks';

import styles from './hana-game.module.scss';

export interface FoundCell {
  col: number;
  row: number;
}

export const HanaGame: FC = () => {
  const {
    completed,
    loadTry,
    matrix,
    chars,
    isFoundCell,
    onCharSelected,
    getNewBoard,
  } = useHanaPage();

  if (!matrix) {
    return (
      <div className={clsx(styles.root, styles.loading)}>
        Loading... ({loadTry})
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {completed && <CompletedModal reloadBoard={getNewBoard} />}
      <div className={clsx(styles.half, styles.matrix)}>
        <WordMatrix rows={matrix} isFoundCell={isFoundCell} />
      </div>
      <div className={clsx(styles.half, styles.circle)}>
        <CharsCircle chars={chars!} onCharSelected={onCharSelected} />
      </div>
    </div>
  );
};
