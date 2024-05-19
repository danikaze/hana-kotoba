import { Matrix2D } from '@utils/matrix-2d';
import { EMPTY_CELL } from './matrix-words';

export interface WordPosition {
  word: string;
  direction: 'v' | 'h';
  col: number;
  row: number;
}

/**
 * Given a matrix, find all the words and return them with the needed
 * information to reconstruct the matrix later (position and orientation)
 */
export function findMatrixWords(
  matrix: Readonly<Matrix2D<string>>
): WordPosition[] {
  const words: WordPosition[] = [];
  let word: string = '';
  let startCol: number = -1;
  let startRow: number = -1;

  function addWord(direction: WordPosition['direction']): void {
    // if it was only 1 letter, it was a vertical word crossed
    if (word.length > 1) {
      words.push({
        direction,
        word,
        col: startCol,
        row: startRow,
      });
    }

    word = '';
    startCol = -1;
    startRow = -1;
  }

  function checkCell(direction: WordPosition['direction']) {
    return (cell: string, col: number, row: number) => {
      // line jump
      if (
        (direction === 'h' && startRow !== -1 && startRow !== row) ||
        (direction === 'v' && startCol !== -1 && startCol !== col)
      ) {
        addWord(direction);
      }

      if (word) {
        if (word && cell === EMPTY_CELL) {
          // find the (possible) end of a word
          addWord(direction);
        } else {
          // continue with the next character of a word
          word += cell;
        }
        // find the (possible) start of a word
      } else if (cell !== EMPTY_CELL) {
        startCol = col;
        startRow = row;
        word = cell;
      }
    };
  }

  matrix.iterateHorizontally(checkCell('h'));
  addWord('h');
  matrix.iterateVertically(checkCell('v'));
  addWord('v');

  return words;
}
