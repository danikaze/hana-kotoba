import { FC } from 'react';
import { clsx } from 'clsx';

import { isSmallChar } from '@utils/jp';

import styles from './word-matrix.module.scss';

export interface Props {
  /**
   * - `false` means no slot available
   * - empty string means free slot available
   * - a character means a used slot
   */
  rows: Cell[][];
}

type Cell = string | false;

export const WordMatrix: FC<Props> = ({ rows }) => {
  const classes = clsx(
    styles.root,
    styles[`cell${Math.max(rows.length, rows[0].length)}`]
  );

  return (
    <div className={classes}>
      {rows.map((row, index) => (
        <Row key={index} row={row} />
      ))}
    </div>
  );
};

const Row: FC<{ row: Cell[] }> = ({ row }) => {
  return (
    <div className={styles.row}>
      {row.map((cell, col) => (
        <Cell key={col} cell={cell} />
      ))}
    </div>
  );
};

const Cell: FC<{ cell: Cell }> = ({ cell }) => {
  if (cell === false) {
    return <div className={clsx(styles.cell, styles.empty)}></div>;
  }

  return (
    <div className={styles.cell}>
      <span className={clsx(isSmallChar(cell) && styles.small)}>{cell}</span>
    </div>
  );
};
