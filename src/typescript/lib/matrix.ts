export default class Matrix<T> {
  m: number;
  n: number;
  _backingArray: T[][] = [new Array(1)];

  constructor(m: number = 0, n: number = 0) {
    this.m = m;
    this.n = n;

    this._backingArray = new Array(m).fill(0).map(() => new Array(n).fill(0));
  }

  set(m: number, n: number, value: T) {
    this._backingArray[m | 0][n | 0] = value;
    return this;
  }

  get(m: number, n: number, defaultValue?: T) {
    return this._backingArray[m | 0]?.[n | 0] ?? defaultValue;
  }

  fill(fn: (col: number, row: number) => T) {
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        this.set(i, j, fn(i, j));
      }
    }

    return this;
  }

  forEach(fn: (row: number, col: number, value: T) => void) {
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const value = this.get(i, j);
        fn(i, j, value!);
      }
    }

    return this;
  }

  fromString(str: string, parser: RegExp, converter: (block: string, r: number, c: number) => T) {
    const globalRegExp = new RegExp(parser, 'g');
    const rows = str
      .trim()
      .split('\n')
      .map((row, rowIdx) => {
        const newRow = [];
        let matchCount = 0;
        for (const block of row.matchAll(globalRegExp)) {
          newRow.push(converter(block[0], rowIdx, matchCount++));
        }
        return newRow;
      });
    this._backingArray = rows;
    this.m = this._backingArray.length;
    this.n = this._backingArray[0].length;

    return this;
  }

  resize(m: number, n: number) {
    this.m = m;
    this.n = n;

    this._backingArray.length = m;
    for (let i = 0; i < this._backingArray.length; i++) {
      this._backingArray[i].length = n;
    }

    return this;
  }

  refit(fitNewItem: (i: number, j: number) => T) {
    const maxN = Math.max(...this._backingArray.map((row) => row.length));
    this._backingArray.forEach((row, i) => {
      const length = row.length;
      row.length = maxN;
      for (let j = length; j < row.length; j++) {
        row[j] = fitNewItem(i, j);
      }
    });

    return this;
  }
}
