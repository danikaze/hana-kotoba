import { isHiragana, isKatakana, isKanji } from './jp';

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
});
