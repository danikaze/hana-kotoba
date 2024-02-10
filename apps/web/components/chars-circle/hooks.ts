import {
  MouseEventHandler,
  RefObject,
  createRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Props } from '.';

export interface CharData {
  index: number;
  char: string;
  ref: RefObject<HTMLDivElement>;
  used: boolean;
  invalid: boolean;
  isWord: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export interface State {
  chars: CharData[];
  vertices: {
    ref: RefObject<HTMLDivElement>;
    invalid: boolean;
  }[];
  word: string;
  wordFound: boolean;
  error: boolean;
}

const SHOW_FOUND_MS = 1500;
const SHOW_ERROR_MS = 1000;

export function useCharsCircle({ chars, onCharSelected }: Props) {
  /*
   * Char click handler
   */
  const clickChar = useCallback(
    (index: number) => {
      setState((state) => {
        // while showing the last word as found or the error, don't accept input
        if (state.wordFound || state.error) {
          return state;
        }

        const lastVertexIndex = state.vertices.length - 1;
        const data = state.chars[index];
        const usedIndex = state.vertices.findIndex(
          (vertex) => vertex.ref === data.ref
        );
        const isUsed = usedIndex !== -1;
        const isLast = usedIndex === lastVertexIndex;
        const lastIsInvalid =
          lastVertexIndex >= 0 && state.vertices[lastVertexIndex].invalid;

        // if it's used and it's not the last one, it's not a possible movement
        if (isUsed && !isLast) {
          return state;
        }

        // if the last one is invalid and it's not deselecting it,
        // forbid continuing the word
        if (!isLast && lastIsInvalid) {
          return state;
        }

        const newChars = [...state.chars];
        const newVertices = [...state.vertices];
        let word = state.word;
        let wordFound = false;

        newChars[index] = {
          ...data,
          used: !data.used,
          invalid: false,
        };

        if (isUsed) {
          newVertices.pop();
          word = word.substring(0, word.length - 1);
        } else {
          word += data.char;
          const wordResult = onCharSelected(word);
          newChars[index].invalid = wordResult === 'INVALID';
          wordFound = wordResult === 'FOUND';
          newVertices.push({
            ref: data.ref,
            invalid: newChars[index].invalid,
          });

          if (wordFound) {
            newVertices.forEach(({ ref }) => {
              const char = newChars.find((c) => c.ref === ref)!;
              char.isWord = true;
            });
          }
        }

        console.log('setState from click');
        return {
          chars: newChars,
          vertices: newVertices,
          word,
          wordFound,
          error: newChars[index].invalid,
        };
      });
    },
    [onCharSelected]
  );

  const [state, setState] = useState<State>({
    chars: [],
    vertices: [],
    word: '',
    wordFound: false,
    error: false,
  });

  /*
   * When the chars are updated (from the props), restart the game
   * It also includes the first initialization
   */
  useEffect(() => {
    setState((state) => {
      console.log('setState from useEffect(chars)');
      const charData: CharData[] = [];
      for (let i = 0; i < chars.length; i++) {
        charData[i] = {
          index: i,
          char: chars[i],
          ref: createRef<HTMLDivElement>(),
          used: false,
          invalid: false,
          isWord: false,
          onClick: () => clickChar(i),
        };
      }

      return {
        chars: charData,
        vertices: state.vertices,
        word: state.word,
        wordFound: state.wordFound,
        error: false,
      };
    });
    // clickChar is updated in the next useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars]);

  /*
   * When the clickChar function is re-created, update the charData to use
   * the new one
   */
  useEffect(() => {
    console.log('setState from useEffect(clickChar)');
    setState((state) => ({
      ...state,
      chars: state.chars.map((char, i) => ({
        ...char,
        onClick: () => clickChar(i),
      })),
    }));
  }, [clickChar]);

  /*
   * When the "show word found flag" is set, schedule the function to hide it
   */
  useEffect(() => {
    if (!state.wordFound) {
      return;
    }

    const handler = setTimeout(() => {
      setState((state) => ({
        x: console.log('setState from removing wordFound'),
        ...state,
        chars: [...state.chars].map((c) => ({
          ...c,
          isWord: false,
          used: false,
        })),
        vertices: [],
        word: '',
        wordFound: false,
      }));
    }, SHOW_FOUND_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [state.wordFound]);

  /*
   * When the "show error flag" is set, schedule the function to hide it
   */
  useEffect(() => {
    if (!state.error) {
      return;
    }

    const handler = setTimeout(() => {
      setState((state) => ({
        x: console.log('setState from removing wordFound'),
        ...state,
        chars: [...state.chars].map((c) =>
          c.invalid
            ? {
                ...c,
                error: false,
                invalid: false,
                used: false,
              }
            : c
        ),
        vertices: state.vertices.slice(0, state.vertices.length - 1),
        word: state.word.substring(0, state.word.length - 1),
        error: false,
      }));
    }, SHOW_ERROR_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [state.error]);

  return {
    charData: state.chars,
    vertices: state.vertices,
    wordFound: state.wordFound,
  };
}
