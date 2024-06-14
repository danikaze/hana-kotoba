import { clsx } from 'clsx';
import { FC } from 'react';

import { isSmallChar } from '@utils/jp';

import { useWordMatrix } from './hooks';

import styles from './word-matrix.module.scss';

export interface Props {
  /**
   * - `false` means no slot available
   * - empty string means free slot available
   * - a character means a used slot
   */
  rows: WordMatrixCell[][];

  /**
   * Check if a cell need sto be shown as newly found
   */
  isFoundCell: (row: number, col: number) => boolean;
}

export type WordMatrixCell = string | false;

export const WordMatrix: FC<Props> = ({ rows, isFoundCell }) => {
  const { ref, cellSize } = useWordMatrix(rows);

  return (
    <div className={styles.root} ref={ref}>
      {rows.map((row, index) => (
        <Row
          key={index}
          index={index}
          cellSize={cellSize}
          row={row}
          isFoundCell={isFoundCell}
        />
      ))}
    </div>
  );
};

const Row: FC<{
  index: number;
  cellSize: number | undefined;
  row: Props['rows'][number];
  isFoundCell: Props['isFoundCell'];
}> = ({ index, cellSize, row, isFoundCell }) => {
  return (
    <div className={styles.row} style={{ height: cellSize }}>
      {row.map((cell, col) => (
        <Cell
          key={col}
          cell={cell}
          cellSize={cellSize}
          isFound={isFoundCell(index, col)}
        />
      ))}
    </div>
  );
};

const Cell: FC<{
  cell: WordMatrixCell;
  cellSize: number | undefined;
  isFound: boolean;
}> = ({ cell, cellSize, isFound }) => {
  const style = {
    width: cellSize,
    height: cellSize,
  };

  const cellElem =
    cell === false ? (
      <div className={clsx(styles.cell, styles.empty)} />
    ) : (
      <div className={clsx(styles.cell, isFound && styles.found)}>
        <span className={clsx(isSmallChar(cell) && styles.small)}>{cell}</span>
      </div>
    );

  return (
    <div className={styles.cellContainer} style={style}>
      {cellElem}
    </div>
  );
};
