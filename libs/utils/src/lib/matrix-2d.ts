export type IgnoreComposeCellFn<T> = (
  /** current data from the specified matrix */
  data: T,
  /** data currently in the target cell */
  origin: T,
  /** column of the target cell */
  targetColumn: number,
  /** row of the target cell */
  targetRow: number,
  /** column of the origin cell */
  originColumn: number,
  /** row of the origin cell */
  originRow: number
) => boolean;

export class Matrix2D<T> {
  private data: T[][];

  public static from<T>(data: T[][], copy?: boolean): Matrix2D<T> {
    const matrix = new Matrix2D<T>(0, 0);
    matrix.data = copy ? data.map((row) => [...row]) : data;
    return matrix;
  }

  /**
   * Create a matrix with the specified size and the same content for
   * every cell
   * ```
   * createMatrix(3, 1, 'x'); // [['x', 'x', 'x']];
   * ```
   */
  constructor(width: number, height: number, content?: T);
  /**
   * Create a matrix with the specified size and content depending on the cell
   * ```
   * createMatrix(2, 3, (i, j) => `${i},${j}`;
   * [
   *   ['0,0', '1,0'],
   *   ['0,1', '1,1'],
   *   ['0,2', '1,2'],
   * ]
   * ```
   */
  constructor(
    width: number,
    height: number,
    content?: (i: number, j: number) => T
  );
  constructor(
    width: number,
    height: number,
    content?: T | ((i: number, j: number) => T)
  ) {
    this.data = [];

    for (let j = 0; j < height; j++) {
      const row: T[] = [];
      this.data.push(row);

      for (let i = 0; i < width; i++) {
        row[i] =
          typeof content === 'function'
            ? (content as (i: number, j: number) => T)(i, j)
            : (content as T);
      }
    }
  }

  public clone(): Matrix2D<T> {
    return new Matrix2D(this.width(), this.height(), (i, j) => this.get(i, j));
  }

  public equals(matrix: Matrix2D<T>): boolean {
    if (this.width() !== matrix.width()) return false;
    if (this.height() !== matrix.height()) return false;
    let equal = true;
    this.iterateHorizontally((cell, col, row) => {
      if (matrix.get(col, row) !== cell) {
        // sets the return value
        equal = false;
        // stops the iterations
        return false;
      }
    });
    return equal;
  }

  public width(): number {
    if (this.data.length === 0) return 0;
    return this.data[0].length;
  }

  public height(): number {
    return this.data.length;
  }

  public get(column: number, row: number): T {
    return this.data[row][column];
  }

  public set(column: number, row: number, value: T): void {
    this.data[row][column] = value;
  }

  /**
   * Return a copy of the data (cells are still references)
   */
  public toArray(): T[][] {
    return this.data.map((row) => [...row]);
  }

  /**
   * in-line transpose of the data
   */
  public transpose(): void {
    const transposed = new Matrix2D<T>(
      this.height(),
      this.width(),
      (i: number, j: number) => this.data[i][j]
    );
    this.data = transposed.data;
  }

  /**
   * Iterate every cell of the matrix horizontally as:
   * 1 2 3
   * 4 5 6
   * 7 8 9
   *
   * If the callback explicitly returns `false`, it stops
   */
  public iterateHorizontally(
    callback: (cell: T, col: number, row: number) => boolean | void
  ): void {
    const height = this.height();
    if (height === 0) return;

    const width = this.width();
    for (let j = 0; j < height; j++) {
      const row = this.data[j];
      for (let i = 0; i < width; i++) {
        if (callback(row[i], i, j) === false) return;
      }
    }
  }

  /**
   * Iterate every cell of the matrix vertically as:
   * 1 4 7
   * 2 5 8
   * 3 6 9
   *
   * If the callback explicitly returns `false`, it stops
   */
  public iterateVertically(
    callback: (cell: T, col: number, row: number) => boolean | void
  ): void {
    const height = this.height();
    if (height === 0) return;

    const width = this.width();
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (callback(this.data[j][i], i, j) === false) return;
      }
    }
  }

  public addRow(row: number, content?: T | ((column: number) => T)): void {
    const newRow: T[] = [];
    const width = this.width();
    this.data.splice(row, 0, newRow);

    for (let i = 0; i < width; i++) {
      newRow[i] =
        typeof content === 'function'
          ? (content as (column: number) => T)(i)
          : (content as T);
    }
  }

  public addColumn(column: number, content?: T | ((row: number) => T)): void {
    const height = this.height();

    for (let i = 0; i < height; i++) {
      const cell =
        typeof content === 'function'
          ? (content as (row: number) => T)(i)
          : (content as T);
      this.data[i].splice(column, 0, cell);
    }
  }

  public compose<U extends T>(
    matrix: Matrix2D<U>,
    offsetColumn: number = 0,
    offsetRow: number = 0,
    ignore?: U | IgnoreComposeCellFn<U>
  ): void {
    for (
      let or = 0, tr = offsetRow;
      or < matrix.height() && tr < this.height();
      or++, tr++
    ) {
      if (tr < 0) continue;
      for (
        let oc = 0, tc = offsetColumn;
        oc < matrix.width() && tc < this.width();
        oc++, tc++
      ) {
        if (tc < 0) continue;
        const data = matrix.get(oc, or);
        if (typeof ignore === 'function') {
          if (
            (ignore as IgnoreComposeCellFn<T>)(
              data,
              this.get(tc, tr),
              tc,
              tr,
              oc,
              or
            )
          ) {
            continue;
          }
        } else if (ignore === data) {
          continue;
        }

        this.set(tc, tr, data);
      }
    }
  }
}
