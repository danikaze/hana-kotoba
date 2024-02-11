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
  /**
   * Check if a cell need sto be shown as newly found
   */
  isFoundCell: (row: number, col: number) => boolean;
}

type Cell = string | false;

export const WordMatrix: FC<Props> = ({ rows, isFoundCell }) => {
  const classes = clsx(
    styles.root,
    styles[`cell${Math.max(rows.length, rows[0].length)}`]
  );

  return (
    <div className={classes}>
      {rows.map((row, index) => (
        <Row key={index} index={index} row={row} isFoundCell={isFoundCell} />
      ))}
    </div>
  );
};

const Row: FC<{
  index: number;
  row: Props['rows'][number];
  isFoundCell: Props['isFoundCell'];
}> = ({ index, row, isFoundCell }) => {
  return (
    <div className={styles.row}>
      {row.map((cell, col) => (
        <Cell key={col} cell={cell} isFound={isFoundCell(index, col)} />
      ))}
    </div>
  );
};

const Cell: FC<{ cell: Cell; isFound: boolean }> = ({ cell, isFound }) => {
  if (cell === false) {
    return <div className={clsx(styles.cell, styles.empty)}></div>;
  }

  return (
    <div className={clsx(styles.cell, isFound && styles.found)}>
      <span className={clsx(isSmallChar(cell) && styles.small)}>{cell}</span>
    </div>
  );
};
