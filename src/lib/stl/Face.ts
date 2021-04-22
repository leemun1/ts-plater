import { Point3 } from './Point3';

export class Face {
  v: Point3[] = [];
  constructor(v0: Point3, v1: Point3, v2: Point3) {
    this.v[0] = v0;
    this.v[1] = v1;
    this.v[2] = v2;
  }
}
