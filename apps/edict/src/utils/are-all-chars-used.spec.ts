import { areAllCharsUsed } from './are-all-chars-used';

describe('areAllCharsUsed', () => {
  it('should return false when not all the chars are used', () => {
    expect(areAllCharsUsed('ああああい', [])).toBe(false);
    expect(areAllCharsUsed('ああああい', ['あい'])).toBe(false);
    expect(areAllCharsUsed('ああいうえ', ['あい', 'あう', 'あえ'])).toBe(false);
  });

  it('should return true when all the chars are used', () => {
    expect(areAllCharsUsed('あいうえお', ['あいうえお'])).toBe(true);
    expect(areAllCharsUsed('あいうえお', ['あいう', 'えお'])).toBe(true);
    expect(areAllCharsUsed('ああうえお', ['あう', 'えお', 'あいあ'])).toBe(
      true
    );
  });
});
