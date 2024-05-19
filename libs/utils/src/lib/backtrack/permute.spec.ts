import { permute } from './permute';

describe('Permuter', () => {
  it('Default options', () => {
    const r1 = permute({ pool: [1, 2, 3], minLength: 1, maxLength: 1 });
    const r2 = permute({ pool: [1, 2, 3], minLength: 2, maxLength: 2 });
    const r3 = permute({ pool: [1, 2, 3], minLength: 3, maxLength: 3 });

    expect(r1).toEqual([[1], [2], [3]]);
    expect(r2).toEqual([
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 3],
      [3, 1],
      [3, 2],
    ]);
    expect(r3).toEqual([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ]);
  });

  it('orderInsensitive', () => {
    const res = permute({
      pool: [1, 2, 3],
      minLength: 2,
      orderInsensitive: true,
    });
    expect(res).toEqual([
      [1, 2],
      [1, 2, 3],
      [1, 3],
      [2, 3],
    ]);
  });

  it('with repetitions', () => {
    const r1 = permute({
      pool: [1, 2, 3],
      maxLength: 2,
      withRepetitions: true,
    });
    expect(r1).toEqual([
      [1],
      [1, 1],
      [1, 2],
      [1, 3],
      [2],
      [2, 1],
      [2, 2],
      [2, 3],
      [3],
      [3, 1],
      [3, 2],
      [3, 3],
    ]);
  });

  it('with repetitions and orderInsensitive', () => {
    const r1 = permute({
      pool: [1, 2, 3],
      withRepetitions: true,
      orderInsensitive: true,
      maxLength: 3,
    });
    expect(r1).toEqual([
      [1],
      [1, 1],
      [1, 1, 1],
      [1, 1, 2],
      [1, 1, 3],
      [1, 2],
      [1, 2, 2],
      [1, 2, 3],
      [1, 3],
      [1, 3, 3],
      [2],
      [2, 2],
      [2, 2, 2],
      [2, 2, 3],
      [2, 3],
      [2, 3, 3],
      [3],
      [3, 3],
      [3, 3, 3],
    ]);
  });
});
