import { useCallback, useEffect, useState } from 'react';
import {
  EMPTY_CELL,
  deserializeMatrixWords,
  matrixFromPositionedWords,
} from '@game/matrix-words';
import { Matrix2D } from '@utils/matrix-2d';
import { WordPosition } from '@game/find-matrix-words';

import { SHOW_FOUND_MS } from '../../constants/ui';
import { FoundCell } from '.';

interface WordData extends WordPosition {
  found?: boolean;
}

export type CharSelectedResult = 'INVALID' | 'VALID' | 'FOUND';

export function useHanaPage() {
  const [loadTry, setLoadTry] = useState<number>(1);
  const [matrix, setMatrix] = useState<Matrix2D<string | false> | undefined>();
  const [words, setWords] = useState<WordData[]>([]);
  const [chars, setChars] = useState<string[] | undefined>();
  const [foundCells, setFoundCells] = useState<FoundCell[]>([]);
  const [completed, setCompleted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/game', {
        credentials: 'omit',
      });
      const json = await res.json();

      if (json.w) {
        const words = deserializeMatrixWords(json.w);
        const matrix = matrixFromPositionedWords(words);
        const board = new Matrix2D<string | false>(
          matrix.width(),
          matrix.height(),
          (col, row) => (matrix.get(col, row) === EMPTY_CELL ? false : '')
        );
        setChars(json.k.split(''));
        setWords(words);
        setMatrix(board);
      }
    } catch (e) {
      console.info(e);
      console.info('retrying...');
      setLoadTry((n) => n + 1);
      fetchData();
    }
  }, []);

  const onCharSelected = useCallback(
    (word: string): CharSelectedResult => {
      // check if the word is a new found word
      const wordIndex = words.findIndex((w) => !w.found && w.word === word);
      const foundNewWord = wordIndex !== -1;

      if (foundNewWord) {
        const newWords = [...words];
        const wordData = newWords[wordIndex];
        wordData.found = true;

        // schedule the change as it cannot be updated while it's rendering
        setTimeout(() => {
          setWords(newWords);
          const newMatrix = matrix!.clone();
          const cells = Matrix2D.from([word.split('')]);
          if (wordData.direction === 'v') {
            cells.transpose();
          }
          newMatrix.compose(cells, wordData.col, wordData.row);
          setMatrix(newMatrix);

          const newFoundCells: FoundCell[] = [];
          for (let i = 0; i < wordData.word.length; i++) {
            newFoundCells.push({
              row: wordData.row + (wordData.direction === 'v' ? i : 0),
              col: wordData.col + (wordData.direction === 'h' ? i : 0),
            });
          }
          setFoundCells(newFoundCells);
        });

        // schedule unshowing the new words as found
        setTimeout(() => {
          setFoundCells([]);
        }, SHOW_FOUND_MS);

        return 'FOUND';
      }

      // check if there is any valid word starting like that
      return words.some((w) => !w.found && w.word.startsWith(word))
        ? 'VALID'
        : 'INVALID';
    },
    [words, matrix]
  );

  const isFoundCell = useCallback(
    (row: number, col: number): boolean => {
      return foundCells.some((cell) => cell.col === col && cell.row === row);
    },
    [foundCells]
  );

  const getNewBoard = useCallback(() => {
    setLoadTry(0);
    setMatrix(undefined);
    setCompleted(false);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Every time a new word is found, check if the board is complete
   */
  useEffect(() => {
    // check only when the "new found word highlight" ends
    if (foundCells.length > 0) return;

    setCompleted(() => words.every((word) => word.found));
  }, [words, foundCells]);

  return {
    completed,
    loadTry,
    chars,
    matrix: matrix?.toArray(),
    onCharSelected,
    isFoundCell,
    getNewBoard,
  };
}
