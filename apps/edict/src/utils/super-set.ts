/**
 * Class to overcome the "bug" or limitation where a Set can only
 * store a maximum of 2^24 elements:
 * https://github.com/nodejs/node/issues/37320
 *
 * And using just arrays and checking for duplicates it's too slow
 */
export class SuperSet<T> {
  private static readonly MAX_ELEMS = Math.pow(2, 24) - 1;

  private sets: Array<Set<T>>;
  private last: Set<T>;
  private count: number;

  constructor() {
    this.last = new Set();
    this.sets = [this.last];
    this.count = 0;
  }

  public get size(): number {
    return this.count;
  }

  public add(value: T): void {
    const set = this.find(value);
    if (set) return;

    if (this.last.size === SuperSet.MAX_ELEMS) {
      this.last = new Set();
      this.sets.push(this.last);
    }

    this.last.add(value);
    this.count++;
  }

  public has(value: T): boolean {
    return this.find(value) !== undefined;
  }

  public toArray(): T[] {
    const arr: T[] = [];

    for (let i = 0; i < this.sets.length; i++) {
      for (const value of this.sets[i].values()) {
        arr.push(value);
      }
    }

    return arr;
  }

  private find(value: T): Set<T> | undefined {
    for (let i = 0; i < this.sets.length; i++) {
      if (this.sets[i].has(value)) return this.sets[i];
    }
  }
}
