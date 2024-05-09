import { isSubSet } from './is-subset';

describe('isSubset', () => {
  it('should return true when the "part" can be written with the characters of the "all"', () => {
    expect(isSubSet('', '')).toBe(true);
    expect(isSubSet('', 'あ')).toBe(true);
    expect(isSubSet('あ', 'あ')).toBe(true);

    expect(isSubSet('あ', '')).toBe(false);

    expect(isSubSet('さとう', 'おとうさん')).toBe(true);
    expect(isSubSet('あいう', 'あいうえお')).toBe(true);
    expect(isSubSet('あいう', 'あいうえお')).toBe(true);
    expect(isSubSet('あいう', 'ういあえお')).toBe(true);
    expect(isSubSet('いあう', 'ういあえお')).toBe(true);

    expect(isSubSet('ああ', 'あいうえお')).toBe(false);
  });
});
