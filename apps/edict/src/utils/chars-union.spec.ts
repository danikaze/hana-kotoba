import { charsUnion } from './chars-union';

describe('charsUnion', () => {
  it('should return the union of two characters set', () => {
    expect(charsUnion('', '')).toBe('');
    expect(charsUnion('あ', '')).toBe('あ');
    expect(charsUnion('', 'あ')).toBe('あ');

    expect(charsUnion('あ', 'え')).toBe('あえ');
    expect(charsUnion('あ', 'あ')).toBe('あ');
    expect(charsUnion('ああ', 'あ')).toBe('ああ');

    expect(charsUnion('おかね', 'ねこ')).toBe('おかねこ');
  });
});
