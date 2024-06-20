import { useCallback, useEffect, useMemo, useState } from 'react';

import { WordPosition } from '@game/find-matrix-words';
import {
  EMPTY_CELL,
  deserializeMatrixWords,
  matrixFromPositionedWords,
} from '@game/matrix-words';
import { Matrix2D } from '@utils/matrix-2d';

import {
  API_CALL_MAX_RETRIES,
  JISHO_WORDS_AS_ACCORDION,
  SHOW_FOUND_MS,
} from '../../constants/ui';
import { JishoWordGroup } from '../jisho-panel';

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
  const [foundWords, setFoundWords] = useState<JishoWordGroup[]>([]);
  const [openJishoWords, setOpenWords] = useState<number[]>([]);
  const [isJishoModalOpen, setJishoModalOpen] = useState<boolean>(false);
  const [isOptionsModalOpen, setOptionsModalOpen] = useState<boolean>(false);

  const fetchGameData = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.API_URL}/game`, {
        credentials: 'omit',
      });
      const json = await res.json();

      if (json.w) {
        const words = deserializeMatrixWords(
          json.w,
          process.env.NODE_ENV === 'production'
        );
        const matrix = matrixFromPositionedWords(words);
        const board = new Matrix2D<string | false>(
          matrix.width(),
          matrix.height(),
          (col, row) => (matrix.get(col, row) === EMPTY_CELL ? false : '')
        );
        setChars(json.k.split(''));
        setWords(words);
        setMatrix(board);
        setFoundWords([]);
      }
    } catch (e) {
      console.info(e);
      if (loadTry > API_CALL_MAX_RETRIES) return;
      console.info('retrying...');
      setLoadTry((n) => n + 1);
      fetchGameData();
    }
  }, [loadTry]);

  const fetchWordData = useCallback(async (word: string) => {
    try {
      const res = await fetch(`${process.env.API_URL}/jisho/${word}`);
      const json = await res.json();
      setFoundWords((current) => [...current, { kana: word, words: json }]);
    } catch (e) {
      console.info(e);
    }
  }, []);

  const toggleJishoWord = useMemo(() => {
    if (JISHO_WORDS_AS_ACCORDION) {
      return (index: number) =>
        setOpenWords(([openWord]) => (openWord === index ? [] : [index]));
    }

    return (index: number) =>
      setOpenWords((openWords) => {
        const newOpenWords = [...openWords];
        const i = newOpenWords.indexOf(index);
        if (i === -1) {
          newOpenWords.push(index);
        } else {
          newOpenWords.splice(i, 1);
        }
        return newOpenWords;
      });
  }, []);

  const toggleJishoModal = useCallback(() => {
    setJishoModalOpen((isOpen) => !isOpen);
  }, []);

  const toggleOptionsModal = useCallback(() => {
    setOptionsModalOpen((isOpen) => !isOpen);
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
        fetchWordData(wordData.word);

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
    [fetchWordData, words, matrix]
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
    fetchGameData();
  }, [fetchGameData]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  /**
   * Every time a new word is found, check if the board is complete
   */
  useEffect(() => {
    // check only when the "new found word highlight" ends
    if (foundCells.length > 0) return;

    setCompleted(() => words.every((word) => word.found));
  }, [words, foundCells]);

  return {
    openJishoWords,
    toggleJishoWord,
    totalWords: words.length,
    completed,
    loadTry,
    chars,
    foundWords,
    isJishoModalOpen,
    isOptionsModalOpen,
    matrix: matrix?.toArray(),
    onCharSelected,
    isFoundCell,
    getNewBoard,
    toggleJishoModal,
    toggleOptionsModal,
  };
}
