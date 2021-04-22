export class Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  overlaps(other: Rectangle) {
    return (
      this.x1 <= other.x2 &&
      this.x2 >= other.x1 &&
      this.y1 <= other.y2 &&
      this.y2 >= other.y1
    );
  }

  contains(x: number, y: number) {
    return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;
  }
}
