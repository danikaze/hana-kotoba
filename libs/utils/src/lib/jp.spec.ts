import { isHiragana, isKatakana, isKanji, isSmallChar } from './jp';

describe('Japanese utility functions', () => {
  it('should identify hiragana characters', () => {
    expect(isHiragana('あ')).toBe(true);
    expect(isHiragana('ぁ')).toBe(true);
    expect(isHiragana('か')).toBe(true);
    expect(isHiragana('が')).toBe(true);

    expect(isHiragana('ゐ')).toBe(true);

    expect(isHiragana('ア')).toBe(false);
    expect(isHiragana('ァ')).toBe(false);
    expect(isHiragana('パ')).toBe(false);

    expect(isHiragana('亜')).toBe(false);
  });

  it('should identify katakana characters', () => {
    expect(isKatakana('あ')).toBe(false);
    expect(isKatakana('ぁ')).toBe(false);
    expect(isKatakana('か')).toBe(false);
    expect(isKatakana('が')).toBe(false);

    expect(isKatakana('ゐ')).toBe(false);

    expect(isKatakana('ア')).toBe(true);
    expect(isKatakana('ァ')).toBe(true);
    expect(isKatakana('パ')).toBe(true);

    expect(isKatakana('亜')).toBe(false);
  });

  it('should identify kanji characters', () => {
    expect(isKanji('あ')).toBe(false);
    expect(isKanji('ぁ')).toBe(false);
    expect(isKanji('か')).toBe(false);
    expect(isKanji('が')).toBe(false);

    expect(isKanji('ゐ')).toBe(false);

    expect(isKanji('ア')).toBe(false);
    expect(isKanji('ァ')).toBe(false);
    expect(isKanji('パ')).toBe(false);

    expect(isKanji('亜')).toBe(true);
  });

  it('should identify small characters', () => {
    expect(isSmallChar('っ')).toBe(true);
    expect(isSmallChar('つ')).toBe(false);

    expect(isSmallChar('ゃ')).toBe(true);
    expect(isSmallChar('や')).toBe(false);

    expect(isSmallChar('ゅ')).toBe(true);
    expect(isSmallChar('ゆ')).toBe(false);

    expect(isSmallChar('ょ')).toBe(true);
    expect(isSmallChar('よ')).toBe(false);

    expect(isSmallChar('ぁ')).toBe(true);
    expect(isSmallChar('あ')).toBe(false);

    expect(isSmallChar('ぃ')).toBe(true);
    expect(isSmallChar('い')).toBe(false);

    expect(isSmallChar('ぅ')).toBe(true);
    expect(isSmallChar('う')).toBe(false);

    expect(isSmallChar('ぇ')).toBe(true);
    expect(isSmallChar('え')).toBe(false);

    expect(isSmallChar('ぉ')).toBe(true);
    expect(isSmallChar('お')).toBe(false);

    expect(isSmallChar('ッ')).toBe(true);
    expect(isSmallChar('ツ')).toBe(false);

    expect(isSmallChar('ャ')).toBe(true);
    expect(isSmallChar('ヤ')).toBe(false);

    expect(isSmallChar('ュ')).toBe(true);
    expect(isSmallChar('ユ')).toBe(false);

    expect(isSmallChar('ョ')).toBe(true);
    expect(isSmallChar('ヨ')).toBe(false);

    expect(isSmallChar('ァ')).toBe(true);
    expect(isSmallChar('ア')).toBe(false);

    expect(isSmallChar('ィ')).toBe(true);
    expect(isSmallChar('イ')).toBe(false);

    expect(isSmallChar('ゥ')).toBe(true);
    expect(isSmallChar('ウ')).toBe(false);

    expect(isSmallChar('ォ')).toBe(true);
    expect(isSmallChar('オ')).toBe(false);
  });
});
