import { WordPosition } from './find-matrix-words';
import { getWordsNeededChars, getWordsUniqueChars } from './get-word-chars';

const list: WordPosition[] = [
  {
    word: 'あえいおう',
    direction: 'h',
    col: 0,
    row: 0,
  },
  {
    word: 'あああああ',
    direction: 'h',
    col: 0,
    row: 0,
  },
  {
    word: 'かけく',
    direction: 'h',
    col: 0,
    row: 0,
  },
];

describe('getWordsUniqueChars', () => {
  it('should return empty array if there are no words', () => {
    expect(getWordsUniqueChars([])).toEqual([]);
  });

  it('should return unique characters from a list of words', () => {
    expect(getWordsUniqueChars(list.slice(0, 1))).toEqual([
      'あ',
      'え',
      'い',
      'お',
      'う',
    ]);
    expect(getWordsUniqueChars(list.slice(1, 2))).toEqual(['あ']);
    expect(getWordsUniqueChars(list.slice(1, 3))).toEqual([
      'あ',
      'か',
      'け',
      'く',
    ]);
  });
});

describe('getWordsNeededChars', () => {
  it('should return empty array if there are no words', () => {
    expect(getWordsNeededChars([])).toEqual([]);
  });

  it('should return the needed characters from a list of words', () => {
    expect(getWordsNeededChars(list.slice(0, 1))).toEqual([
      'あ',
      'え',
      'い',
      'お',
      'う',
    ]);
    expect(getWordsNeededChars(list.slice(1, 2))).toEqual([
      'あ',
      'あ',
      'あ',
      'あ',
      'あ',
    ]);
    expect(getWordsNeededChars(list.slice(1, 3))).toEqual([
      'あ',
      'あ',
      'あ',
      'あ',
      'あ',
      'か',
      'け',
      'く',
    ]);

    expect(
      getWordsNeededChars([
        'いと',
        'いね',
        'とう',
        'とうぶ',
        'とい',
        'いう',
      ]).sort()
    ).toEqual(['い', 'う', 'と', 'ね', 'ぶ'].sort());

    expect(
      getWordsNeededChars([
        'ひび',
        'かし',
        'かしつ',
        'しか',
        'しつ',
        'つか',
      ]).sort()
    ).toEqual(['ひ', 'び', 'か', 'し', 'つ'].sort());
  });
});
