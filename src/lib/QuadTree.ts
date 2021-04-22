import { Rectangle } from './Rectangle';
import { Triangle } from './Triangle';

export class QuadTree {
  depth: number;
  r: Rectangle;
  quad1: QuadTree | null = null;
  quad2: QuadTree | null = null;
  quad3: QuadTree | null = null;
  quad4: QuadTree | null = null;
  triangles: Triangle[] = [];
  black: boolean;

  constructor(x1: number, y1: number, x2: number, y2: number, depth: number) {
    this.depth = depth;
    this.r = new Rectangle(x1, y1, x2, y2);
    this.black = false;

    const xm = (x1 + x2) / 2;
    const ym = (y1 + y2) / 2;

    if (depth > 0) {
      this.quad1 = new QuadTree(x1, y1, xm, ym, depth - 1);
      this.quad2 = new QuadTree(xm, y1, x2, ym, depth - 1);
      this.quad3 = new QuadTree(x1, ym, xm, y2, depth - 1);
      this.quad4 = new QuadTree(xm, ym, x2, y2, depth - 1);
    }
  }

  add(t: Triangle) {
    if (this.depth > 0 && !this.black) {
      if (t.containsRectangle(this.r)) {
        this.black = true;
        this.quad1 = null;
        this.quad2 = null;
        this.quad3 = null;
        this.quad4 = null;
      } else if (t.box.overlaps(this.r)) {
        if (this.quad1) this.quad1.add(t);
        if (this.quad2) this.quad2.add(t);
        if (this.quad3) this.quad3.add(t);
        if (this.quad4) this.quad4.add(t);
      }
    } else {
      this.triangles.push(t);
    }
  }

  get(x: number, y: number, all: Triangle[]) {
    if (this.r.contains(x, y)) {
      if (this.depth > 0) {
        if (this.quad1) this.quad1.get(x, y, all);
        if (this.quad2) this.quad2.get(x, y, all);
        if (this.quad3) this.quad3.get(x, y, all);
        if (this.quad4) this.quad4.get(x, y, all);
      } else {
        for (let i = 0; i < this.triangles.length; i++) {
          all.push(this.triangles[i]);
        }
      }
    }
  }

  test(x: number, y: number): boolean {
    if (this.r.contains(x, y)) {
      if (this.black) {
        return true;
      }
      if (this.depth > 0) {
        return (
          (!!this.quad1 && this.quad1.test(x, y)) ||
          (!!this.quad2 && this.quad2.test(x, y)) ||
          (!!this.quad3 && this.quad3.test(x, y)) ||
          (!!this.quad4 && this.quad4.test(x, y))
        );
      } else {
        for (let i = 0; i < this.triangles.length; i++) {
          if (this.triangles[i]._contains(x, y)) {
            return true;
          }
        }

        return false;
      }
    } else {
      return false;
    }
  }
}
