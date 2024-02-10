'use client';

import { FC } from 'react';
import { clsx } from 'clsx';

import { WordMatrix } from '../word-matrix';
import { CharsCircle } from '../chars-circle';
import { useHanaPage } from './hooks';

import styles from './hana-game.module.scss';

export const HanaGame: FC = () => {
  const { loadTry, matrix, chars, onCharSelected } = useHanaPage();

  if (!matrix) {
    return (
      <div className={clsx(styles.root, styles.loading)}>
        Loading... ({loadTry})
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={clsx(styles.half, styles.matrix)}>
        <WordMatrix rows={matrix} />
      </div>
      <div className={clsx(styles.half, styles.circle)}>
        <CharsCircle chars={chars!} onCharSelected={onCharSelected} />
      </div>
    </div>
  );
};
