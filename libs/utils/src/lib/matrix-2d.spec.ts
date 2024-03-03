import { Matrix2D } from './matrix-2d';

describe('Matrix2D class', () => {
  function getPrivateData<T>(matrix: Matrix2D<T>): T[][] {
    return (matrix as unknown as { data: T[][] }).data;
  }

  describe('constructor', () => {
    it('should create empty matrices', () => {
      const m1 = new Matrix2D(2, 3);
      expect(m1.toArray()).toEqual([
        [undefined, undefined],
        [undefined, undefined],
        [undefined, undefined],
      ]);

      const m2 = new Matrix2D(0, 1);
      expect(m2.toArray()).toEqual([[]]);

      const m3 = new Matrix2D(1, 0);
      expect(m3.toArray()).toEqual([]);

      const m4 = new Matrix2D(0, 0);
      expect(m4.toArray()).toEqual([]);
    });

    it('should create matrices with a basic value', () => {
      const m1 = new Matrix2D(1, 3, 'x');
      expect(m1.toArray()).toEqual([['x'], ['x'], ['x']]);
    });

    it('should create matrices with dynamic values', () => {
      const fn = (i: number, j: number) => `${i},${j}`;
      const m1 = new Matrix2D(2, 3, fn);
      expect(m1.toArray()).toEqual([
        ['0,0', '1,0'],
        ['0,1', '1,1'],
        ['0,2', '1,2'],
      ]);
    });

    it('should create matrices from raw data', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      // referenced data
      const m1 = Matrix2D.from(data);
      expect(m1.width()).toBe(3);
      expect(m1.height()).toBe(2);
      expect(m1.toArray()).toEqual(data);
      expect(getPrivateData(m1)).toBe(data);

      // copied data
      const m2 = Matrix2D.from(data, true);
      expect(m2.width()).toBe(3);
      expect(m2.height()).toBe(2);
      expect(m2.toArray()).toEqual(data);
      expect(getPrivateData(m2)).not.toBe(data);
    });
  });

  describe('getter/setter', () => {
    it('should fail when accessing unexisting elements', () => {
      const m = Matrix2D.from([
        [1, 2, 3],
        [4, 5, 6],
      ]);

      expect(() => m.get(-1, -1)).toThrow();
    });

    it('should provide access to cells', () => {
      const m = Matrix2D.from([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(m.get(0, 0)).toBe(1);
      expect(m.get(1, 0)).toBe(2);
      expect(m.get(2, 0)).toBe(3);
      expect(m.get(0, 1)).toBe(4);
      expect(m.get(1, 1)).toBe(5);
      expect(m.get(2, 1)).toBe(6);

      m.set(1, 1, 0);
      m.set(2, 0, -1);
      expect(m.get(0, 0)).toBe(1);
      expect(m.get(1, 0)).toBe(2);
      expect(m.get(2, 0)).toBe(-1);
      expect(m.get(0, 1)).toBe(4);
      expect(m.get(1, 1)).toBe(0);
      expect(m.get(2, 1)).toBe(6);
    });
  });

  describe('clone', () => {
    it('should clone matrices', () => {
      const m1 = Matrix2D.from([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      const m2 = m1.clone();

      expect(getPrivateData(m1)).not.toBe(getPrivateData(m2));
      expect(m1.toArray()).toEqual(m2.toArray());
    });

    it('should allow independent modifications in the cloned matrix', () => {
      const m1 = Matrix2D.from([
        [1, 2],
        [3, 4],
      ]);

      const m2 = m1.clone();
      m1.set(1, 1, 0);
      m2.set(0, 0, 0);
      expect(m1.toArray()).toEqual([
        [1, 2],
        [3, 0],
      ]);
      expect(m2.toArray()).toEqual([
        [0, 2],
        [3, 4],
      ]);
    });
  });

  describe('equals', () => {
    const matrix = Matrix2D.from([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);

    it('should return false if size is different', () => {
      const sameFirstRow = Matrix2D.from([[1, 2, 3]]);
      expect(matrix.equals(sameFirstRow)).toBe(false);
      expect(sameFirstRow.equals(matrix)).toBe(false);

      const sameFirstColumn = Matrix2D.from([[1], [4], [7]]);
      expect(matrix.equals(sameFirstColumn)).toBe(false);
      expect(sameFirstColumn.equals(matrix)).toBe(false);
    });

    it('should return false if any value is different', () => {
      const differentValue = matrix.clone();
      differentValue.set(1, 1, 0);
      expect(matrix.equals(differentValue)).toBe(false);
      expect(differentValue.equals(matrix)).toBe(false);
    });

    it('should return true if every value is the same', () => {
      const same = matrix.clone();
      expect(matrix.equals(same)).toBe(true);
      expect(same.equals(matrix)).toBe(true);
    });

    it('should return true comparing with itself', () => {
      expect(matrix.equals(matrix)).toBe(true);
    });

    it('should return true on empty matrices', () => {
      const empty1 = new Matrix2D(0, 0);
      const empty2 = new Matrix2D(0, 0);
      expect(empty1.equals(empty2)).toBe(true);
    });

    it('should return true on uninitialized matrices of the same size', () => {
      const default1 = new Matrix2D(3, 4);
      const default2 = new Matrix2D(3, 4);
      expect(default1.equals(default2)).toBe(true);
    });
  });

  describe('transpose', () => {
    it('should "do nothing" on 0-sized matrices', () => {
      const m = new Matrix2D(0, 0);
      expect(m.toArray()).toEqual([]);
      m.transpose();
      expect(m.toArray()).toEqual([]);
    });

    it('should transpose square matrices', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const tData = [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ];
      const m = Matrix2D.from(data);
      expect(m.toArray()).toEqual(data);
      m.transpose();
      expect(m.toArray()).toEqual(tData);
      m.transpose();
      expect(m.toArray()).toEqual(data);
    });

    it('should transpose non-square matrices', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const tData = [
        [1, 4],
        [2, 5],
        [3, 6],
      ];
      const m = Matrix2D.from(data);
      expect(m.toArray()).toEqual(data);
      m.transpose();
      expect(m.toArray()).toEqual(tData);
      m.transpose();
      expect(m.toArray()).toEqual(data);
    });
  });

  describe('iterate', () => {
    it('should not call the callback on size 0 matrices', () => {
      const m = new Matrix2D(0, 0);
      const cb = jest.fn();

      m.iterateHorizontally(cb);
      expect(cb).not.toHaveBeenCalled();

      m.iterateVertically(cb);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should iterate matrices horizontally', () => {
      const m = Matrix2D.from([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      const cb = jest.fn();

      m.iterateHorizontally(cb);
      expect(cb).toHaveBeenCalledTimes(6);
      expect(cb).toHaveBeenNthCalledWith(1, 1, 0, 0);
      expect(cb).toHaveBeenNthCalledWith(2, 2, 1, 0);
      expect(cb).toHaveBeenNthCalledWith(3, 3, 2, 0);
      expect(cb).toHaveBeenNthCalledWith(4, 4, 0, 1);
      expect(cb).toHaveBeenNthCalledWith(5, 5, 1, 1);
      expect(cb).toHaveBeenNthCalledWith(6, 6, 2, 1);
    });

    it('should iterate matrices horizontally', () => {
      const m = Matrix2D.from([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      const cb = jest.fn();

      m.iterateVertically(cb);
      expect(cb).toHaveBeenCalledTimes(6);
      expect(cb).toHaveBeenNthCalledWith(1, 1, 0, 0);
      expect(cb).toHaveBeenNthCalledWith(2, 4, 0, 1);
      expect(cb).toHaveBeenNthCalledWith(3, 2, 1, 0);
      expect(cb).toHaveBeenNthCalledWith(4, 5, 1, 1);
      expect(cb).toHaveBeenNthCalledWith(5, 3, 2, 0);
      expect(cb).toHaveBeenNthCalledWith(6, 6, 2, 1);
    });
  });

  describe('addRow', () => {
    it('should add rows at the specified position', () => {
      const m = Matrix2D.from<number | string>([
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
      ]);

      m.addRow(0, 'A');
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
      ]);

      m.addRow(2, 'B');
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        [2, 2, 2],
      ]);

      // add with function
      m.addRow(4, (col: number) => `C${col}`);
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        ['C0', 'C1', 'C2'],
        [2, 2, 2],
      ]);

      // add to the end with m.height()
      m.addRow(m.height(), 'D');
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        ['C0', 'C1', 'C2'],
        [2, 2, 2],
        ['D', 'D', 'D'],
      ]);

      // add from the end with negative numbers
      m.addRow(-1, 'E');
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        ['C0', 'C1', 'C2'],
        [2, 2, 2],
        ['E', 'E', 'E'],
        ['D', 'D', 'D'],
      ]);

      // using a out-of-bounds row just adds to the end
      m.addRow(m.height() + 5, 'F');
      expect(m.toArray()).toEqual([
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        ['C0', 'C1', 'C2'],
        [2, 2, 2],
        ['E', 'E', 'E'],
        ['D', 'D', 'D'],
        ['F', 'F', 'F'],
      ]);

      // using a negative out-of-bounds row just adds to the beginning
      m.addRow(-50, 'G');
      expect(m.toArray()).toEqual([
        ['G', 'G', 'G'],
        ['A', 'A', 'A'],
        [0, 0, 0],
        ['B', 'B', 'B'],
        [1, 1, 1],
        ['C0', 'C1', 'C2'],
        [2, 2, 2],
        ['E', 'E', 'E'],
        ['D', 'D', 'D'],
        ['F', 'F', 'F'],
      ]);
    });
  });

  describe('addColumn', () => {
    it('should add columns at the specified position', () => {
      const m = Matrix2D.from<number | string>([
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
      ]);

      m.addColumn(0, 'A');
      expect(m.toArray()).toEqual([
        ['A', 0, 0, 0],
        ['A', 1, 1, 1],
        ['A', 2, 2, 2],
      ]);

      m.addColumn(2, 'B');
      expect(m.toArray()).toEqual([
        ['A', 0, 'B', 0, 0],
        ['A', 1, 'B', 1, 1],
        ['A', 2, 'B', 2, 2],
      ]);

      // add with function
      m.addColumn(4, (col: number) => `C${col}`);
      expect(m.toArray()).toEqual([
        ['A', 0, 'B', 0, 'C0', 0],
        ['A', 1, 'B', 1, 'C1', 1],
        ['A', 2, 'B', 2, 'C2', 2],
      ]);

      // add to the end with m.width()
      m.addColumn(m.width(), 'D');
      expect(m.toArray()).toEqual([
        ['A', 0, 'B', 0, 'C0', 0, 'D'],
        ['A', 1, 'B', 1, 'C1', 1, 'D'],
        ['A', 2, 'B', 2, 'C2', 2, 'D'],
      ]);

      // add from the end with negative numbers
      m.addColumn(-1, 'E');
      expect(m.toArray()).toEqual([
        ['A', 0, 'B', 0, 'C0', 0, 'E', 'D'],
        ['A', 1, 'B', 1, 'C1', 1, 'E', 'D'],
        ['A', 2, 'B', 2, 'C2', 2, 'E', 'D'],
      ]);

      // using a out-of-bounds column just adds to the end
      m.addColumn(m.width() + 5, 'F');
      expect(m.toArray()).toEqual([
        ['A', 0, 'B', 0, 'C0', 0, 'E', 'D', 'F'],
        ['A', 1, 'B', 1, 'C1', 1, 'E', 'D', 'F'],
        ['A', 2, 'B', 2, 'C2', 2, 'E', 'D', 'F'],
      ]);

      // using a negative out-of-bounds column just adds to the beginning
      m.addColumn(-50, 'G');
      expect(m.toArray()).toEqual([
        ['G', 'A', 0, 'B', 0, 'C0', 0, 'E', 'D', 'F'],
        ['G', 'A', 1, 'B', 1, 'C1', 1, 'E', 'D', 'F'],
        ['G', 'A', 2, 'B', 2, 'C2', 2, 'E', 'D', 'F'],
      ]);
    });
  });

  describe('compose', () => {
    let matrix: Matrix2D<number>;

    beforeEach(() => {
      matrix = new Matrix2D(3, 3, 0);
    });

    it('should compose data from the given matrix (by default from top-left corner)', () => {
      const data = new Matrix2D(2, 2, 1);
      matrix.compose(data);

      expect(matrix.toArray()).toEqual([
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
      ]);
    });

    it('should not modify the data matrix', () => {
      const m1 = new Matrix2D(2, 2, 1);
      matrix.compose(m1);

      expect(m1.toArray()).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });

    it('should allow specifying an offset', () => {
      // it can specify how to "join" centers
      const m2 = new Matrix2D(2, 2, 2);
      matrix.compose(m2, 1, 1);
      expect(matrix.toArray()).toEqual([
        [0, 0, 0],
        [0, 2, 2],
        [0, 2, 2],
      ]);
    });

    it('should drop data out of bounds', () => {
      const m3 = new Matrix2D(1, 3, 3);
      matrix.compose(m3, 1, -1);
      expect(matrix.toArray()).toEqual([
        [0, 3, 0],
        [0, 3, 0],
        [0, 0, 0],
      ]);

      const m4 = new Matrix2D(4, 1, 4);
      matrix.compose(m4, 1, 2);
      expect(matrix.toArray()).toEqual([
        [0, 3, 0],
        [0, 3, 0],
        [0, 4, 4],
      ]);
    });

    it('should allow specifying data to ignore', () => {
      const m5 = new Matrix2D(3, 2, -1);
      m5.addRow(1, 5);
      expect(m5.toArray()).toEqual([
        [-1, -1, -1],
        [5, 5, 5],
        [-1, -1, -1],
      ]);

      matrix.compose(m5, 0, 0, -1);
      expect(matrix.toArray()).toEqual([
        [0, 0, 0],
        [5, 5, 5],
        [0, 0, 0],
      ]);

      const m6 = new Matrix2D(2, 3, -1);
      m6.addColumn(1, 6);
      expect(m6.toArray()).toEqual([
        [-1, 6, -1],
        [-1, 6, -1],
        [-1, 6, -1],
      ]);

      matrix.compose(
        m6,
        0,
        0,
        (data: number, origin: number) => data === -1 || origin !== 0
      );
      expect(matrix.toArray()).toEqual([
        [0, 6, 0],
        [5, 5, 5],
        [0, 6, 0],
      ]);
    });
  });
});
