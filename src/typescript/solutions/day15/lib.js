window.Vector = class Vector {
  $tag = 'VECTOR';
  x;
  y;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(xOrVector, y = 0) {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x + xOrVector.x, this.y + xOrVector.y);
    } else {
      return new Vector(this.x + xOrVector, this.y + y);
    }
  }

  sub(xOrVector, y = 0) {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x - xOrVector.x, this.y - xOrVector.y);
    } else {
      return new Vector(this.x - xOrVector, this.y - y);
    }
  }

  scale(s) {
    return new Vector(this.x * s, this.y * s);
  }

  clip() {
    return new Vector(Math.round(this.x), Math.round(this.y));
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
};

window.Matrix = class Matrix {
  m;
  n;
  _backingArray = [new Array(1)];

  constructor(m = 0, n = 0) {
    this.m = m;
    this.n = n;

    this._backingArray = new Array(m).fill(0).map(() => new Array(n).fill(0));
  }

  set(m, n, value) {
    this._backingArray[m | 0][n | 0] = value;
    return this;
  }

  get(m, n, defaultValue) {
    return this._backingArray[m | 0]?.[n | 0] ?? defaultValue;
  }

  fill(fn) {
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        this.set(i, j, fn(i, j));
      }
    }

    return this;
  }

  forEach(fn) {
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const value = this.get(i, j);
        fn(i, j, value);
      }
    }

    return this;
  }

  fromString(str, parser, converter = (i) => i) {
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

  resize(m, n) {
    this.m = m;
    this.n = n;

    this._backingArray.length = m;
    for (let i = 0; i < this._backingArray.length; i++) {
      this._backingArray[i].length = n;
    }

    return this;
  }

  refit(fitNewItem) {
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
};
