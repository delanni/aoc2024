export default class Vector {
  readonly $tag = 'VECTOR';
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector): Vector;
  add(x: number, y: number): Vector;
  add(xOrVector: number | Vector, y: number = 0): Vector {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x + xOrVector.x, this.y + xOrVector.y);
    } else {
      return new Vector(this.x + xOrVector, this.y + y);
    }
  }

  sub(v: Vector): Vector;
  sub(x: number, y: number): Vector;
  sub(xOrVector: number | Vector, y: number = 0): Vector {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x - xOrVector.x, this.y - xOrVector.y);
    } else {
      return new Vector(this.x - xOrVector, this.y - y);
    }
  }

  scale(s: number): Vector {
    return new Vector(this.x * s, this.y * s);
  }

  clip(): Vector {
    return new Vector(Math.round(this.x), Math.round(this.y));
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
