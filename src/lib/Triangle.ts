import { Rectangle } from './Rectangle';
import { Point2 } from './stl/Point2';

export class Triangle {
  A: Point2;
  B: Point2;
  C: Point2;
  AB: Point2;
  BC: Point2;
  CA: Point2;
  nAB: Point2;
  nBC: Point2;
  nCA: Point2;
  box: Rectangle;

  static getSide(pt: Point2, n: Point2, s: Point2) {
    const scalarN = n.x * pt.x + n.y * pt.y;

    if (scalarN == 0) {
      const scalar = s.x * pt.x + s.y * pt.y;
      return scalar > 0;
    }

    return scalarN < 0;
  }

  constructor(A: Point2, B: Point2, C: Point2) {
    this.A = A;
    this.B = B;
    this.C = C;

    // Segments
    this.AB = new Point2(B.x - A.x, B.y - A.y);
    this.BC = new Point2(C.x - B.x, C.y - B.y);
    this.CA = new Point2(A.x - C.x, A.y - C.y);

    // Segments normals
    this.nAB = new Point2(this.AB.y, -this.AB.x);
    this.nBC = new Point2(this.BC.y, -this.BC.x);
    this.nCA = new Point2(this.CA.y, -this.CA.x);

    this.box = new Rectangle(
      Math.min(A.x, Math.min(B.x, C.x)),
      Math.min(A.y, Math.min(B.y, C.y)),
      Math.max(A.x, Math.max(B.x, C.x)),
      Math.max(A.y, Math.max(B.y, C.y))
    );
  }

  _contains(x: number, y: number) {
    const vectorA = new Point2(x - this.A.x, y - this.A.y);
    const vectorB = new Point2(x - this.B.x, y - this.B.y);
    const vectorC = new Point2(x - this.C.x, y - this.C.y);

    const sideA = Triangle.getSide(vectorA, this.nAB, this.AB);
    const sideB = Triangle.getSide(vectorB, this.nBC, this.BC);
    const sideC = Triangle.getSide(vectorC, this.nCA, this.CA);

    return sideA && sideB && sideC;
  }

  containsPoint(p: Point2) {
    return this._contains(p.x, p.y);
  }

  containsRectangle(rect: Rectangle) {
    return (
      this._contains(rect.x1, rect.y1) &&
      this._contains(rect.x1, rect.y2) &&
      this._contains(rect.x2, rect.y1) &&
      this._contains(rect.x2, rect.y2)
    );
  }
}
