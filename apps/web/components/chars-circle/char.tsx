import { forwardRef } from 'react';
import { clsx } from 'clsx';

import { isSmallChar } from '@utils/jp';
import { CharData } from './hooks';

import styles from './chars-circle.module.scss';

export type Props = CharData & {
  total: number;
};

export const Char = forwardRef<HTMLDivElement, Props>(
  ({ index, char, used, invalid, isWord, onClick }, ref) => {
    const classes = clsx(
      styles.char,
      styles[`char${index}`],
      used && styles.used,
      invalid && styles.invalid,
      isWord && styles.found
    );

    return (
      <div ref={ref} onClick={onClick} className={classes}>
        <span className={clsx(isSmallChar(char) && styles.small)}>{char}</span>
      </div>
    );
  }
);
Char.displayName = 'Char';
